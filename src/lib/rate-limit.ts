/**
 * Simple in-memory rate limiter for login attempts.
 * Resets after WINDOW_MS. Not shared across serverless instances.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const store = new Map<
  string,
  { count: number; firstAttemptAt: number }
>();

function getKey(identifier: string): string {
  return `login:${identifier}`;
}

export function isRateLimited(identifier: string): boolean {
  const key = getKey(identifier);
  const entry = store.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    store.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordAttempt(identifier: string): void {
  const key = getKey(identifier);
  const now = Date.now();
  const entry = store.get(key);
  if (!entry) {
    store.set(key, { count: 1, firstAttemptAt: now });
    return;
  }
  if (now - entry.firstAttemptAt > WINDOW_MS) {
    store.set(key, { count: 1, firstAttemptAt: now });
    return;
  }
  entry.count += 1;
}

export function getRemainingAttempts(identifier: string): number {
  const key = getKey(identifier);
  const entry = store.get(key);
  if (!entry) return MAX_ATTEMPTS;
  if (Date.now() - entry.firstAttemptAt > WINDOW_MS) return MAX_ATTEMPTS;
  return Math.max(0, MAX_ATTEMPTS - entry.count);
}

export function getRetryAfterMs(identifier: string): number {
  const key = getKey(identifier);
  const entry = store.get(key);
  if (!entry) return 0;
  const elapsed = Date.now() - entry.firstAttemptAt;
  if (elapsed >= WINDOW_MS) return 0;
  return WINDOW_MS - elapsed;
}

export function clearAttempts(identifier: string): void {
  store.delete(getKey(identifier));
}
