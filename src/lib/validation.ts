export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 200;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type Field = "email" | "password" | "displayName";

export type ValidationResult =
  | { ok: true; value: { email: string; password: string; displayName: string | null } }
  | { ok: false; field: Field; error: string };

/** Normalises and validates the sign-in / sign-up payload. */
export function validateCredentials(body: unknown): ValidationResult {
  const data = (body ?? {}) as Record<string, unknown>;

  const rawEmail = typeof data.email === "string" ? data.email : "";
  const email = rawEmail.trim().toLowerCase();

  if (!email) {
    return { ok: false, field: "email", error: "Please enter your email address." };
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { ok: false, field: "email", error: "That doesn't look like a valid email address." };
  }

  const password = typeof data.password === "string" ? data.password : "";
  if (!password) {
    return { ok: false, field: "password", error: "Please enter your password." };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { ok: false, field: "password", error: "That password is too long." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      field: "password",
      error: `Your password needs to be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  const rawName = typeof data.displayName === "string" ? data.displayName.trim() : "";
  const displayName = rawName ? rawName.slice(0, 80) : null;

  return { ok: true, value: { email, password, displayName } };
}
