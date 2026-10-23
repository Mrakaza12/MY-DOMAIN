/**
 * Accounts stored in this browser.
 *
 * Passwords are salted and stretched with PBKDF2-HMAC-SHA256 (WebCrypto) before
 * anything is written to localStorage. This is a static site: there is no
 * server, so accounts are per-browser and cannot follow you to another device.
 * Never reuse an important password here.
 */

import { MIN_PASSWORD_LENGTH, normaliseEmail } from "./validation";

const ACCOUNTS_KEY = "keyline.accounts.v1";
const SESSION_KEY = "keyline.session.v1";
const EVENTS_KEY = "keyline.events.v1";
const THROTTLE_KEY = "keyline.throttle.v1";

const ITERATIONS = 210_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;
const SESSION_DAYS = 30;
const MAX_EVENTS_PER_ACCOUNT = 20;
const THROTTLE_WINDOW_MS = 10 * 60 * 1000;
const THROTTLE_MAX_FAILURES = 10;

export type Account = {
  email: string;
  passwordHash: string;
  displayName: string | null;
  createdAt: string;
};

export type SessionUser = {
  email: string;
  displayName: string | null;
  createdAt: string;
};

export type SignInEvent = {
  id: string;
  email: string;
  outcome: "signup" | "success" | "failed" | "logout";
  createdAt: string;
};

export type AuthResult = { ok: true } | { ok: false; error: string; field?: string };

function storageAvailable(): boolean {
  try {
    const probe = "__keyline_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function storageProblem(): string | null {
  return storageAvailable()
    ? null
    : "This browser is blocking local storage, so accounts cannot be saved. Turn off private browsing or allow site data and try again.";
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return window.btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations, hash: "SHA-256" },
    keyMaterial,
    KEY_BITS,
  );

  return new Uint8Array(bits);
}

/** Encodes as `pbkdf2$<iterations>$<saltB64>$<hashB64>`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

/** Compares byte-by-byte without an early exit. */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a[index] ^ b[index];
  }
  return difference === 0;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4) return false;

  const [scheme, iterations, saltB64, hashB64] = parts;
  if (scheme !== "pbkdf2") return false;

  const expected = fromBase64(hashB64);
  const salt = fromBase64(saltB64);
  const actual = await derive(password, salt, Number(iterations));

  return constantTimeEqual(expected, actual);
}

function getAccounts(): Record<string, Account> {
  return readJson<Record<string, Account>>(ACCOUNTS_KEY, {});
}

function saveAccounts(accounts: Record<string, Account>): void {
  writeJson(ACCOUNTS_KEY, accounts);
}

function pushEvent(email: string, outcome: SignInEvent["outcome"]): void {
  const all = readJson<SignInEvent[]>(EVENTS_KEY, []);
  all.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email,
    outcome,
    createdAt: new Date().toISOString(),
  });

  const trimmed = all.slice(-200);
  writeJson(EVENTS_KEY, trimmed);
}

export function listEvents(email: string): SignInEvent[] {
  const normalised = normaliseEmail(email);
  return readJson<SignInEvent[]>(EVENTS_KEY, [])
    .filter((event) => event.email === normalised)
    .slice(-MAX_EVENTS_PER_ACCOUNT)
    .reverse();
}

type Throttle = { failures: number; resetAt: number };

function readThrottle(): Record<string, Throttle> {
  return readJson<Record<string, Throttle>>(THROTTLE_KEY, {});
}

function isThrottled(email: string): boolean {
  const bucket = readThrottle()[email];
  return Boolean(bucket && bucket.resetAt > Date.now() && bucket.failures >= THROTTLE_MAX_FAILURES);
}

function noteFailure(email: string): void {
  const store = readThrottle();
  const now = Date.now();
  const bucket = store[email];

  if (!bucket || bucket.resetAt <= now) {
    store[email] = { failures: 1, resetAt: now + THROTTLE_WINDOW_MS };
  } else {
    bucket.failures += 1;
  }

  writeJson(THROTTLE_KEY, store);
}

function clearFailures(email: string): void {
  const store = readThrottle();
  delete store[email];
  writeJson(THROTTLE_KEY, store);
}

export async function signUp(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<AuthResult> {
  const problem = storageProblem();
  if (problem) return { ok: false, error: problem };

  const email = normaliseEmail(input.email);
  const accounts = getAccounts();

  if (accounts[email]) {
    return {
      ok: false,
      field: "email",
      error: "An account with this email already exists in this browser. Try signing in.",
    };
  }

  const passwordHash = await hashPassword(input.password);
  const name = input.displayName?.trim();

  accounts[email] = {
    email,
    passwordHash,
    displayName: name ? name.slice(0, 80) : null,
    createdAt: new Date().toISOString(),
  };

  saveAccounts(accounts);
  createSession(accounts[email]);
  pushEvent(email, "signup");

  return { ok: true };
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const problem = storageProblem();
  if (problem) return { ok: false, error: problem };

  const email = normaliseEmail(input.email);

  if (isThrottled(email)) {
    return {
      ok: false,
      error: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  const account = getAccounts()[email];

  if (!account) {
    noteFailure(email);
    pushEvent(email, "failed");
    return { ok: false, field: "password", error: "Email or password is incorrect." };
  }

  const matches = await verifyPassword(input.password, account.passwordHash);

  if (!matches) {
    noteFailure(email);
    pushEvent(email, "failed");
    return { ok: false, field: "password", error: "Email or password is incorrect." };
  }

  clearFailures(email);
  createSession(account);
  pushEvent(email, "success");

  return { ok: true };
}

function createSession(account: Account): void {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  writeJson(SESSION_KEY, { email: account.email, expiresAt });
}

export function getSessionUser(): SessionUser | null {
  const session = readJson<{ email?: string; expiresAt?: string } | null>(SESSION_KEY, null);
  if (!session?.email || !session.expiresAt) return null;

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    clearSession();
    return null;
  }

  const account = getAccounts()[session.email];
  if (!account) {
    clearSession();
    return null;
  }

  return {
    email: account.email,
    displayName: account.displayName,
    createdAt: account.createdAt,
  };
}

function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function signOut(): void {
  const user = getSessionUser();
  if (user) pushEvent(user.email, "logout");
  clearSession();
}

export { MIN_PASSWORD_LENGTH };
