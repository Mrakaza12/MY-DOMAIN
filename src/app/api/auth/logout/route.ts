import { destroySession, getSessionUser, recordLoginEvent } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  try {
    const user = await getSessionUser();
    await destroySession();

    if (user) {
      await recordLoginEvent({ userId: user.id, email: user.email, outcome: "logout" });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Sign-out failed", error);
    return Response.json({ ok: false, error: "Could not sign out." }, { status: 500 });
  }
}
