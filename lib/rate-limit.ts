import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";
import { NextResponse } from "next/server";

// Public APIs: 30 requests per 10 seconds per IP
const publicLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "10 s"),
  prefix: "rl:public",
});

// Authenticated APIs: 20 requests per 10 seconds per user
const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  prefix: "rl:auth",
});

// Write APIs: 5 requests per 10 seconds per user
const writeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  prefix: "rl:write",
});

function rateLimitResponse(result: { limit: number; remaining: number; reset: number }) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
      },
    }
  );
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "127.0.0.1";
}

/**
 * Rate limit by client IP address (for public endpoints)
 * Returns a 429 Response if rate limited, or null if OK
 */
export async function rateLimitByIp(request: Request): Promise<NextResponse | null> {
  try {
    const ip = getClientIp(request);
    const result = await publicLimiter.limit(ip);
    if (!result.success) return rateLimitResponse(result);
    return null;
  } catch (error) {
    console.error("[Rate Limit] Error:", error);
    return null; // Fail open - don't block requests if rate limiter is down
  }
}

/**
 * Rate limit by user ID (for authenticated endpoints)
 * Returns a 429 Response if rate limited, or null if OK
 */
export async function rateLimitByUser(userId: string): Promise<NextResponse | null> {
  try {
    const result = await authLimiter.limit(userId);
    if (!result.success) return rateLimitResponse(result);
    return null;
  } catch (error) {
    console.error("[Rate Limit] Error:", error);
    return null;
  }
}

/**
 * Rate limit writes by user ID (for mutation endpoints)
 * Returns a 429 Response if rate limited, or null if OK
 */
export async function rateLimitWrite(userId: string): Promise<NextResponse | null> {
  try {
    const result = await writeLimiter.limit(userId);
    if (!result.success) return rateLimitResponse(result);
    return null;
  } catch (error) {
    console.error("[Rate Limit] Error:", error);
    return null;
  }
}
