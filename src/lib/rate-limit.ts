/**
 * Simple in-memory rate limiter.
 * Suitable for serverless because each invocation gets fresh memory;
 * in long-running containers it provides actual rate limiting.
 *
 * For production at scale, replace with Redis or DB-based rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const limiters = new Map<string, Map<string, RateLimitEntry>>();

interface RateLimitConfig {
  /** Unique identifier for the rate limiter (e.g., "ai-chat", "login") */
  id: string;
  /** Maximum requests per window */
  maxRequests: number;
  /** Window size in seconds */
  windowSec: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check and consume a rate limit token.
 * @param config - Rate limit configuration
 * @param key - Client identifier (IP address, user ID, etc.)
 */
export function checkRateLimit(
  config: RateLimitConfig,
  key: string
): RateLimitResult {
  if (!limiters.has(config.id)) {
    limiters.set(config.id, new Map());
  }

  const limiter = limiters.get(config.id)!;
  const now = Date.now();
  const entry = limiter.get(key);

  // Clean up expired entries periodically
  if (limiter.size > 10000) {
    for (const [k, v] of limiter) {
      if (v.resetAt < now) limiter.delete(k);
    }
  }

  if (!entry || entry.resetAt < now) {
    // New window
    const resetAt = now + config.windowSec * 1000;
    limiter.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/** Pre-configured rate limiters */
export const rateLimits = {
  login: { id: "login", maxRequests: 5, windowSec: 60 } as RateLimitConfig,
  aiChat: { id: "ai-chat", maxRequests: 20, windowSec: 60 } as RateLimitConfig,
  aiSearch: {
    id: "ai-search",
    maxRequests: 10,
    windowSec: 60,
  } as RateLimitConfig,
  register: {
    id: "register",
    maxRequests: 3,
    windowSec: 300,
  } as RateLimitConfig,
} as const;

/**
 * Get client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
