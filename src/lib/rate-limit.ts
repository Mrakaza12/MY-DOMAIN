/**
 * A small in-memory throttle for failed sign-in attempts. It is a speed bump,
 * not a security boundary: on serverless platforms each instance keeps its own
 * counters. For higher assurance, move this to Redis or your database.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    return false;
  }

  return bucket.count >= MAX_ATTEMPTS;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    bucket.count += 1;
  }

  if (buckets.size > 5000) {
    for (const [existingKey, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(existingKey);
    }
  }
}

export function clearFailures(key: string): void {
  buckets.delete(key);
}

export function rateLimitKey(ip: string | null, email: string): string {
  return `${ip ?? "unknown"}:${email}`;
}
