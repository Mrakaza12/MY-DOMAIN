import "server-only";

import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { and, eq, gt } from "drizzle-orm";

import { db } from "@/lib/db";
import { loginEvents, sessions, users } from "@/lib/schema";

export const SESSION_COOKIE = "keyline_session";

const SESSION_TTL_DAYS = 30;
const SCRYPT_N = 16384;
const SCRYPT_r = 8;
const SCRYPT_p = 1;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

function deriveKey(
  password: string,
  salt: string,
  keyLength: number,
  options: { N: number; r: number; p: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });
}

/** Hashes a password as `scrypt$N$r$p$saltHex$hashHex`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const key = await deriveKey(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_r,
    p: SCRYPT_p,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_r}$${SCRYPT_p}$${salt}$${key.toString("hex")}`;
}

/** Constant-time verification of a password against a stored hash. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6) return false;

  const [scheme, n, r, p, salt, hash] = parts;
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  if (expected.length === 0) return false;

  const actual = await deriveKey(password, salt, expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Issues a session row and sets the httpOnly cookie. */
export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  const database = await db();
  await database.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export type SessionUser = {
  id: number;
  email: string;
  displayName: string | null;
  createdAt: Date;
};

/** Returns the signed-in user, or null when there is no valid session. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const database = await db();
  const rows = await database
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.tokenHash, hashToken(token)),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    const database = await db();
    await database.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }

  store.delete(SESSION_COOKIE);
}

/** Records an authentication attempt. Never pass a password in here. */
export async function recordLoginEvent(input: {
  userId?: number | null;
  email: string;
  outcome: "signup" | "success" | "failed" | "logout";
}): Promise<void> {
  try {
    const requestHeaders = await headers();
    const forwarded = requestHeaders.get("x-forwarded-for");
    const ipAddress =
      forwarded?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || null;
    const userAgent = requestHeaders.get("user-agent")?.slice(0, 300) ?? null;

    const database = await db();
    await database.insert(loginEvents).values({
      userId: input.userId ?? null,
      email: input.email,
      outcome: input.outcome,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Could not record login event", error);
  }
}
