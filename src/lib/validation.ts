export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 200;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normaliseEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isEmail(value: string): boolean {
  const email = normaliseEmail(value);
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

/** Returns an error message, or null when the credentials look usable. */
export function validateCredentials(email: string, password: string): string | null {
  if (!email.trim()) return "Please enter your email address.";
  if (!isEmail(email)) return "That doesn't look like a valid email address.";
  if (!password) return "Please enter your password.";
  if (password.length > MAX_PASSWORD_LENGTH) return "That password is too long.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Your password needs to be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}
