import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
if (redisUrl && redisToken) {
  redis = new Redis({ url: redisUrl, token: redisToken });
}

const limiterCache = new Map<string, Ratelimit>();

interface LimitOptions {
  scope: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  reset: Date;
  limit: number;
}

const memoryBuckets = new Map<string, { reset: number; count: number; limit: number }>();

export async function checkRateLimit({
  scope,
  identifier,
  limit,
  windowSeconds,
}: LimitOptions): Promise<RateLimitResult> {
  const key = `${scope}:${identifier}`;

  if (redis) {
    const limiterKey = `${scope}:${limit}:${windowSeconds}`;
    let limiter = limiterCache.get(limiterKey);
    if (!limiter) {
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
        analytics: true,
      });
      limiterCache.set(limiterKey, limiter);
    }

    const result = await limiter.limit(key);
    return {
      ok: result.success,
      remaining: result.remaining,
      reset: new Date(result.reset ?? Date.now() + windowSeconds * 1000),
      limit: result.limit,
    };
  }

  // Fallback in-memory limiter for local dev
  const bucket = memoryBuckets.get(key);
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (!bucket || bucket.reset <= now) {
    memoryBuckets.set(key, { count: 1, reset: now + windowMs, limit });
    return {
      ok: true,
      remaining: limit - 1,
      reset: new Date(now + windowMs),
      limit,
    };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      reset: new Date(bucket.reset),
      limit,
    };
  }

  bucket.count += 1;
  memoryBuckets.set(key, bucket);
  return {
    ok: true,
    remaining: Math.max(0, limit - bucket.count),
    reset: new Date(bucket.reset),
    limit,
  };
}

export function rateLimitRetrySeconds(result: RateLimitResult) {
  const diff = result.reset.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 1000));
}
