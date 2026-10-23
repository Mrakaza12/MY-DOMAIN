import { eq } from "drizzle-orm";

import { createSession, hashPassword, recordLoginEvent } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { validateCredentials } from "@/lib/validation";

export const runtime = "nodejs";

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

    const { email, password, displayName } = parsed.value;
    const database = await db();

    const existing = await database
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return Response.json(
        {
          ok: false,
          field: "email",
          error: "An account with this email already exists. Try signing in instead.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const inserted = await database
      .insert(users)
      .values({ email, passwordHash, displayName })
      .returning({ id: users.id });

    const user = inserted[0];
    if (!user) {
      return Response.json(
        { ok: false, error: "We couldn't create your account. Please try again." },
        { status: 500 },
      );
    }

    await createSession(user.id);
    await recordLoginEvent({ userId: user.id, email, outcome: "signup" });

    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Sign-up failed", error);
    return Response.json(
      { ok: false, error: "We couldn't create your account. Please try again." },
      { status: 500 },
    );
  }
}
