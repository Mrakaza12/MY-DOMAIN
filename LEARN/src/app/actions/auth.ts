"use server";

import { eq, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { authEvents, sessions, users, type User } from "@/db/schema";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import {
  identifierKind,
  isEmail,
  isPhone,
  maskEmail,
  normalizeEmail,
  normalizePhone,
} from "@/lib/validation";

export type AuthErrorCode =
  | "identifier_required"
  | "identifier_invalid"
  | "account_not_found"
  | "password_required"
  | "password_incorrect"
  | "email_required"
  | "email_invalid"
  | "email_taken"
  | "phone_invalid"
  | "phone_taken"
  | "name_required"
  | "password_too_short"
  | "password_mismatch"
  | "terms_required"
  | "current_password_incorrect"
  | "server_error";

export type CheckIdentifierResult =
  | { ok: true; identifier: string; kind: "email" | "phone"; exists: boolean; firstName?: string }
  | { ok: false; code: AuthErrorCode };

export type PasswordResult = { ok: true; redirectTo: string } | { ok: false; code: AuthErrorCode };

export type SignUpInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  currency: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

async function findUserByIdentifier(identifier: string): Promise<User | null> {
  const kind = identifierKind(identifier);
  if (!kind) return null;

  if (kind === "email") {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizeEmail(identifier)))
      .limit(1);
    return rows[0] ?? null;
  }

  const phone = normalizePhone(identifier);
  const rows = await db
    .select()
    .from(users)
    .where(or(eq(users.phone, phone), eq(users.phone, phone.replace(/^\+/, ""))))
    .limit(1);
  return rows[0] ?? null;
}

async function logAuthEvent(
  userId: number | null,
  identifier: string,
  type: string,
  detail?: string,
) {
  await db.insert(authEvents).values({
    userId,
    identifier,
    type,
    detail: detail ?? null,
  });
}

export async function checkIdentifier(rawIdentifier: string): Promise<CheckIdentifierResult> {
  const identifier = rawIdentifier.trim();

  if (!identifier) return { ok: false, code: "identifier_required" };

  const kind = identifierKind(identifier);
  if (!kind) return { ok: false, code: "identifier_invalid" };

  try {
    const user = await findUserByIdentifier(identifier);
    return {
      ok: true,
      identifier: kind === "email" ? normalizeEmail(identifier) : normalizePhone(identifier),
      kind,
      exists: Boolean(user),
      firstName: user?.firstName,
    };
  } catch {
    return { ok: false, code: "server_error" };
  }
}

export async function signInWithPassword(
  rawIdentifier: string,
  password: string,
): Promise<PasswordResult> {
  const identifier = rawIdentifier.trim();
  if (!identifier) return { ok: false, code: "identifier_required" };
  if (!identifierKind(identifier)) return { ok: false, code: "identifier_invalid" };
  if (!password) return { ok: false, code: "password_required" };

  try {
    const user = await findUserByIdentifier(identifier);
    if (!user) {
      await logAuthEvent(null, identifier, "login_failed", "Account not found");
      return { ok: false, code: "account_not_found" };
    }

    if (!verifyPassword(password, user.passwordHash)) {
      await logAuthEvent(user.id, identifier, "login_failed", "Incorrect password");
      return { ok: false, code: "password_incorrect" };
    }

    await createSession(user.id);
    await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, user.id));
    await logAuthEvent(user.id, identifier, "login", "Signed in with password");

    return { ok: true, redirectTo: "/account" };
  } catch {
    return { ok: false, code: "server_error" };
  }
}

export async function signUp(input: SignUpInput): Promise<PasswordResult> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = normalizeEmail(input.email);
  const phone = input.phone.trim() ? normalizePhone(input.phone) : null;

  if (!firstName || !lastName) return { ok: false, code: "name_required" };
  if (!email) return { ok: false, code: "email_required" };
  if (!isEmail(email)) return { ok: false, code: "email_invalid" };
  if (phone && !isPhone(phone)) return { ok: false, code: "phone_invalid" };
  if (input.password.length < 8) return { ok: false, code: "password_too_short" };
  if (input.password !== input.confirmPassword) return { ok: false, code: "password_mismatch" };
  if (!input.acceptedTerms) return { ok: false, code: "terms_required" };

  try {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) return { ok: false, code: "email_taken" };

    if (phone) {
      const phoneTaken = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);
      if (phoneTaken.length > 0) return { ok: false, code: "phone_taken" };
    }

    const inserted = await db
      .insert(users)
      .values({
        email,
        phone,
        passwordHash: hashPassword(input.password),
        firstName,
        lastName,
        country: input.country || "GB",
        currency: input.currency || "GBP",
        balanceCents: 250000,
      })
      .returning({ id: users.id });

    const userId = inserted[0].id;
    await createSession(userId);
    await logAuthEvent(userId, email, "signup", "Account created and password stored");
    await logAuthEvent(userId, email, "welcome_balance", "Demo opening balance added");

    return { ok: true, redirectTo: "/account" };
  } catch {
    return { ok: false, code: "server_error" };
  }
}

/**
 * Creates an account straight from the sign-in card (email + password only).
 * Used when someone enters a new email address in the password step so their
 * credentials are stored immediately.
 */
export async function createQuickAccount(
  rawIdentifier: string,
  password: string,
): Promise<PasswordResult> {
  const identifier = rawIdentifier.trim();
  if (!identifierKind(identifier)) return { ok: false, code: "identifier_invalid" };
  if (identifierKind(identifier) === "phone") return { ok: false, code: "account_not_found" };
  if (!password) return { ok: false, code: "password_required" };
  if (password.length < 8) return { ok: false, code: "password_too_short" };

  const email = normalizeEmail(identifier);

  try {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) return { ok: false, code: "email_taken" };

    const localPart = email.split("@")[0] ?? "there";
    const firstName =
      localPart.replace(/[^a-zA-Z]/g, " ").trim().split(/\s+/)[0]?.slice(0, 30) || "there";

    const inserted = await db
      .insert(users)
      .values({
        email,
        passwordHash: hashPassword(password),
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        lastName: "",
        country: "GB",
        currency: "GBP",
        balanceCents: 250000,
      })
      .returning({ id: users.id });

    const userId = inserted[0].id;
    await createSession(userId);
    await logAuthEvent(userId, email, "signup", "Account created from sign-in card");
    await logAuthEvent(userId, email, "welcome_balance", "Demo opening balance added");

    return { ok: true, redirectTo: "/account" };
  } catch {
    return { ok: false, code: "server_error" };
  }
}

export async function signOut(): Promise<{ ok: true }> {
  const user = await getCurrentUser();
  if (user) {
    await logAuthEvent(user.id, user.email, "logout", "Signed out");
  }
  await destroySession();
  return { ok: true };
}

export type EmailLookupResult =
  | { ok: true; maskedEmail: string }
  | { ok: false; code: AuthErrorCode };

export async function lookupEmailByPhone(rawPhone: string): Promise<EmailLookupResult> {
  const phone = rawPhone.trim();
  if (!phone) return { ok: false, code: "identifier_required" };
  if (!isPhone(phone)) return { ok: false, code: "identifier_invalid" };

  try {
    const normalized = normalizePhone(phone);
    const rows = await db
      .select({ email: users.email, id: users.id })
      .from(users)
      .where(or(eq(users.phone, normalized), eq(users.phone, normalized.replace(/^\+/, ""))))
      .limit(1);

    const found = rows[0];
    if (!found) return { ok: false, code: "account_not_found" };

    await logAuthEvent(found.id, normalized, "email_lookup", "Recovered email via mobile number");
    return { ok: true, maskedEmail: maskEmail(found.email) };
  } catch {
    return { ok: false, code: "server_error" };
  }
}

export async function resetPassword(input: {
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<PasswordResult> {
  const email = normalizeEmail(input.email);
  if (!email) return { ok: false, code: "email_required" };
  if (!isEmail(email)) return { ok: false, code: "email_invalid" };
  if (input.password.length < 8) return { ok: false, code: "password_too_short" };
  if (input.password !== input.confirmPassword) return { ok: false, code: "password_mismatch" };

  try {
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const user = rows[0];
    if (!user) return { ok: false, code: "account_not_found" };

    await db
      .update(users)
      .set({ passwordHash: hashPassword(input.password), updatedAt: new Date() })
      .where(eq(users.id, user.id));
    await db.delete(sessions).where(eq(sessions.userId, user.id));
    await logAuthEvent(user.id, email, "password_reset", "Password updated and stored");

    return { ok: true, redirectTo: "/" };
  } catch {
    return { ok: false, code: "server_error" };
  }
}

export type ChangePasswordResult = { ok: true } | { ok: false; code: AuthErrorCode };

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ChangePasswordResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, code: "account_not_found" };
  if (!input.currentPassword) return { ok: false, code: "password_required" };
  if (!verifyPassword(input.currentPassword, user.passwordHash)) {
    return { ok: false, code: "current_password_incorrect" };
  }
  if (input.newPassword.length < 8) return { ok: false, code: "password_too_short" };
  if (input.newPassword !== input.confirmPassword) return { ok: false, code: "password_mismatch" };

  try {
    await db
      .update(users)
      .set({ passwordHash: hashPassword(input.newPassword), updatedAt: new Date() })
      .where(eq(users.id, user.id));
    await logAuthEvent(user.id, user.email, "password_changed", "Password changed from dashboard");
    return { ok: true };
  } catch {
    return { ok: false, code: "server_error" };
  }
}

export async function countStoredAccounts(): Promise<number> {
  try {
    const rows = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    return rows[0]?.count ?? 0;
  } catch {
    return 0;
  }
}
