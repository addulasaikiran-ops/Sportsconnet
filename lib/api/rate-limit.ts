import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitPolicy = {
  name: string;
  limit: number;
  window: "15 m" | "1 h" | "1 m" | "10 m";
  scope: "ip" | "user";
  key: string;
};

const limiters = new Map<string, Ratelimit>();

function getLimiter(policy: RateLimitPolicy) {
  const cacheKey = `${policy.name}:${policy.limit}:${policy.window}`;
  const cached = limiters.get(cacheKey);
  if (cached) return cached;

  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
    prefix: "sportsconnect:ratelimit",
    analytics: false
  });
  limiters.set(cacheKey, limiter);
  return limiter;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Uses a shared Upstash Redis counter, so limits apply across serverless instances.
 * In production, missing or unavailable Redis configuration fails closed.
 * Local development can run without Redis until rate limiting is configured.
 */
export async function enforceRateLimit(
  request: Request,
  policy: RateLimitPolicy
): Promise<NextResponse | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV !== "production") return null;
    return NextResponse.json(
      { error: "Request protection is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const clientIp = request.headers.get("x-real-ip")?.trim()
    || forwarded?.split(",").at(-1)?.trim()
    || "unknown";
  const identifier = policy.scope === "ip"
    ? `ip:${digest(clientIp)}`
    : `user:${digest(policy.key)}`;

  try {
    const result = await getLimiter(policy).limit(`${policy.name}:${identifier}`);
    if (result.success) return null;

    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "Cache-Control": "no-store",
          "X-RateLimit-Limit": String(policy.limit),
          "X-RateLimit-Remaining": String(result.remaining)
        }
      }
    );
  } catch (error) {
    console.error("[SportsConnect rate limit] Shared limiter unavailable.", error);
    if (process.env.NODE_ENV !== "production") return null;
    return NextResponse.json(
      { error: "Request protection is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
