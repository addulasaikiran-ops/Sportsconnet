import { Redis } from "@upstash/redis";

const required = [
  "SPORTSCONNECT_BASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN"
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  throw new Error(`Missing required monitor configuration: ${missing.join(", ")}`);
}

const baseUrl = process.env.SPORTSCONNECT_BASE_URL.replace(/\/$/, "");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const redis = Redis.fromEnv();
const incidentKey = "sportsconnect:monitoring:incident:v1";
const timeoutMs = 8000;
const failures = [];

async function check(name, url, headers = {}) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs)
    });
    const durationMs = Date.now() - started;
    if (!response.ok) failures.push(`${name}: HTTP ${response.status} (${durationMs}ms)`);
    if (durationMs > 2000) failures.push(`${name}: slow response (${durationMs}ms; threshold 2000ms)`);
    return { ok: response.ok, status: response.status, durationMs };
  } catch (error) {
    failures.push(`${name}: request failed (${error instanceof Error ? error.name : "unknown error"})`);
    return { ok: false, durationMs: Date.now() - started };
  }
}

const app = await check("SportsConnect health endpoint", `${baseUrl}/api/health`);
const dbApi = await check("Supabase REST API", `${supabaseUrl}/rest/v1/`, { apikey: supabaseKey });

if (app.ok) {
  try {
    const body = await fetch(`${baseUrl}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs)
    }).then((response) => response.json());
    if (body?.ok !== true) failures.push("SportsConnect health endpoint reports not-ready");
  } catch {
    failures.push("SportsConnect health endpoint returned an unreadable health payload");
  }
}
if (!dbApi.ok) failures.push("Supabase REST API is not healthy");

const previous = await redis.get(incidentKey);
const output = process.env.GITHUB_OUTPUT;
const fs = await import("node:fs/promises");

if (failures.length) {
  const summary = failures.join("; ");
  console.error(`SportsConnect monitor detected an issue: ${summary}`);
  if (!previous) {
    await redis.set(incidentKey, { startedAt: new Date().toISOString(), summary }, { ex: 604800 });
    if (output) await fs.appendFile(output, "alert_required=true\n");
  } else {
    // Keep the original incident open to avoid sending repeated emails every schedule interval.
    await redis.expire(incidentKey, 604800);
    if (output) await fs.appendFile(output, "alert_required=false\n");
  }
  if (output) await fs.appendFile(output, `monitor_summary=${summary.replace(/[\r\n]/g, " ")}\n`);
  process.exitCode = 1;
} else {
  console.log(`SportsConnect healthy. App ${app.durationMs}ms; Supabase REST ${dbApi.durationMs}ms.`);
  if (previous) {
    if (output) await fs.appendFile(output, "recovery_required=true\n");
    await redis.del(incidentKey);
  } else if (output) {
    await fs.appendFile(output, "recovery_required=false\n");
  }
  if (output) await fs.appendFile(output, `monitor_summary=Healthy; app ${app.durationMs}ms; Supabase REST ${dbApi.durationMs}ms\n`);
}
