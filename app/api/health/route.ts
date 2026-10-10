import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function probeDatabase(url: string, key: string) {
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/profiles?select=id&limit=0`, {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function probeRedis(url: string, token: string) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(["PING"]),
      cache: "no-store",
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result?.result === "PONG";
  } catch {
    return false;
  }
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);
  const redisConfigured = Boolean(redisUrl && redisToken);

  const databaseReachable =
    supabaseConfigured && supabaseUrl && supabaseKey
      ? await probeDatabase(supabaseUrl, supabaseKey)
      : false;

  const redisReachable =
    redisConfigured && redisUrl && redisToken
      ? await probeRedis(redisUrl, redisToken)
      : null;

  const productionRateLimitReady =
    process.env.NODE_ENV !== "production" || (redisConfigured && redisReachable === true);

  const ok =
    supabaseConfigured &&
    databaseReachable &&
    productionRateLimitReady;

  return NextResponse.json(
    {
      ok,
      service: "sportsconnect",
      checks: {
        supabaseConfigured,
        databaseReachable,
        rateLimitStoreConfigured: redisConfigured,
        rateLimitStoreReachable: redisReachable
      },
      timestamp: new Date().toISOString()
    },
    {
      status: ok ? 200 : 503,
      headers: { "Cache-Control": "private, no-store, max-age=0" }
    }
  );
}
