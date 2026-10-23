import { eq } from "drizzle-orm";

import { createSession, recordLoginEvent, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { clearFailures, isRateLimited, rateLimitKey, recordFailure } from "@/lib/rate-limit";
import { validateCredentials } from "@/lib/validation";

export const runtime = "nodejs";

function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = validateCredentials(body);
    if (!parsed.ok) {
      return Response.json(
        { ok: false, field: parsed.field, error: parsed.error },
        { status: 400 },
      );
    }

    const { email, password } = parsed.value;
    const throttleKey = rateLimitKey(clientIp(request), email);

    if (isRateLimited(throttleKey)) {
      return Response.json(
        {
          ok: false,
          error: "Too many attempts. Please wait a few minutes and try again.",
        },
        { status: 429 },
      );
    }

    const database = await db();
    const rows = await database
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const account = rows[0];

    // Same message for "no such account" and "wrong password" so the form
    // cannot be used to discover which emails are registered.
    const invalid = () =>
      Response.json(
        { ok: false, field: "password", error: "Email or password is incorrect." },
        { status: 401 },
      );

    if (!account) {
      recordFailure(throttleKey);
      await recordLoginEvent({ email, outcome: "failed" });
      return invalid();
    }

    const passwordMatches = await verifyPassword(password, account.passwordHash);

    if (!passwordMatches) {
      recordFailure(throttleKey);
      await recordLoginEvent({ userId: account.id, email, outcome: "failed" });
      return invalid();
    }

    clearFailures(throttleKey);
    await createSession(account.id);
    await recordLoginEvent({ userId: account.id, email, outcome: "success" });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Sign-in failed", error);
    return Response.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
