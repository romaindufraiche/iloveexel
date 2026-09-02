// A lightweight, in-memory daily quota for the free tier. Good enough to
// validate the product ("5 analyses gratuites par jour") without standing
// up a database: it resets on deploy/restart and doesn't share state across
// serverless instances, so a determined user could get more than 5 by
// hitting a different instance. That's an acceptable gap for an MVP — a
// real subscription system would replace this with a persistent store
// (Redis/Postgres) keyed by account, not just IP.

export const DAILY_FREE_LIMIT = 5;

interface Bucket {
  day: string;
  count: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 20_000;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function sweepStaleEntries(day: string) {
  if (buckets.size < MAX_TRACKED_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.day !== day) buckets.delete(key);
  }
}

export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function peekQuota(key: string): { remaining: number; limit: number } {
  const day = todayKey();
  const bucket = buckets.get(key);
  if (!bucket || bucket.day !== day) return { remaining: DAILY_FREE_LIMIT, limit: DAILY_FREE_LIMIT };
  return { remaining: Math.max(0, DAILY_FREE_LIMIT - bucket.count), limit: DAILY_FREE_LIMIT };
}

export function consumeQuota(key: string): { allowed: boolean; remaining: number; limit: number } {
  const day = todayKey();
  sweepStaleEntries(day);
  const bucket = buckets.get(key);

  if (!bucket || bucket.day !== day) {
    buckets.set(key, { day, count: 1 });
    return { allowed: true, remaining: DAILY_FREE_LIMIT - 1, limit: DAILY_FREE_LIMIT };
  }
  if (bucket.count >= DAILY_FREE_LIMIT) {
    return { allowed: false, remaining: 0, limit: DAILY_FREE_LIMIT };
  }
  bucket.count += 1;
  return { allowed: true, remaining: DAILY_FREE_LIMIT - bucket.count, limit: DAILY_FREE_LIMIT };
}
