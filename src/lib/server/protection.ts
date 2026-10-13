import "server-only";
import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Abuse protection for the brick calculator.
 *
 *  - Cloudflare Turnstile bot check   TURNSTILE_SECRET_KEY (+ NEXT_PUBLIC_TURNSTILE_SITE_KEY in the browser)
 *  - Shared limits & cache            UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (free Upstash Redis)
 *                                     Without Redis, limits are kept in memory per server instance (weaker).
 *  - Daily cap on AI plan reads       PLAN_READS_PER_DAY (default 300, whole site)
 */

/* ---------- Visitor IP ---------- */

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/* ---------- Cloudflare Turnstile ---------- */

export async function verifyTurnstile(token: string | null, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not set up — skip (set it in production)
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (e) {
    console.error("[protection] Turnstile check failed", e);
    return false;
  }
}

/* ---------- Rate limits ---------- */

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null;

type Window = `${number} ${"s" | "m" | "h" | "d"}`;
const RULES = {
  planHour: { max: 5, window: "1 h" },
  planDay: { max: 10, window: "1 d" },
  planGlobal: { max: Number(process.env.PLAN_READS_PER_DAY) || 300, window: "1 d" },
  sizeHour: { max: 20, window: "1 h" },
  quoteHour: { max: 10, window: "1 h" },
} satisfies Record<string, { max: number; window: Window }>;
type Rule = keyof typeof RULES;

const limiters = redis
  ? (Object.fromEntries(
      Object.entries(RULES).map(([name, r]) => [
        name,
        new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(r.max, r.window), prefix: `vh:rl:${name}` }),
      ]),
    ) as Record<Rule, Ratelimit>)
  : null;

/** In-memory fallback when Redis isn't configured: counts per server instance only */
const memory = new Map<string, number[]>();
const ms = (w: Window) => {
  const [n, unit] = w.split(" ");
  return Number(n) * { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }[unit as "s" | "m" | "h" | "d"];
};
function memoryLimit(rule: Rule, id: string) {
  const { max, window } = RULES[rule];
  const key = `${rule}:${id}`;
  const now = Date.now();
  const hits = (memory.get(key) ?? []).filter((t) => now - t < ms(window));
  if (hits.length >= max) return false;
  hits.push(now);
  memory.set(key, hits);
  if (memory.size > 5000) memory.delete(memory.keys().next().value!); // keep memory bounded
  return true;
}

async function allow(rule: Rule, id: string) {
  if (!limiters) return memoryLimit(rule, id);
  try {
    return (await limiters[rule].limit(id)).success;
  } catch (e) {
    console.error("[protection] rate limit check failed", e);
    return true; // don't lock customers out if Redis has a hiccup
  }
}

export type Verdict = { ok: true } | { ok: false; status: number; error: string; message: string };
const block = (status: number, error: string, message: string): Verdict => ({ ok: false, status, error, message });

/** Per-visitor limits, checked before any work is done */
export async function checkVisitor(kind: "plan" | "size" | "quote", ip: string): Promise<Verdict> {
  if (kind === "plan") {
    if (!(await allow("planHour", ip)) || !(await allow("planDay", ip))) {
      return block(429, "too-many-plans", "You've uploaded several plans already. Please try again later, or enter your house size.");
    }
  } else if (kind === "size") {
    if (!(await allow("sizeHour", ip))) return block(429, "too-many", "Too many tries — please wait a little and try again.");
  } else if (!(await allow("quoteHour", ip))) {
    return block(429, "too-many", "Too many quotations requested — please wait a little and try again.");
  }
  return { ok: true };
}

/** Site-wide daily cap on AI plan reads — protects the AI bill from a flood */
export async function checkDailyCap(): Promise<Verdict> {
  if (await allow("planGlobal", "site")) return { ok: true };
  console.warn("[protection] daily plan-reading cap reached");
  return block(503, "plan-reading-unavailable", "Plan reading is busy today — enter your house size for an instant estimate.");
}

/* ---------- Re-upload cache: the same image is only read once ---------- */

const memoryCache = new Map<string, unknown>();
const CACHE_SECONDS = 7 * 24 * 3600;

export const fileHash = (data: Buffer) => createHash("sha256").update(data).digest("hex");

export async function getCached<T>(hash: string): Promise<T | null> {
  try {
    if (redis) return (await redis.get<T>(`vh:plan:${hash}`)) ?? null;
  } catch (e) {
    console.error("[protection] cache read failed", e);
  }
  return (memoryCache.get(hash) as T) ?? null;
}

export async function setCached(hash: string, value: unknown) {
  try {
    if (redis) return void (await redis.set(`vh:plan:${hash}`, value, { ex: CACHE_SECONDS }));
  } catch (e) {
    console.error("[protection] cache write failed", e);
  }
  memoryCache.set(hash, value);
  if (memoryCache.size > 200) memoryCache.delete(memoryCache.keys().next().value!);
}

/** Estimates must be used within this time to create a quotation */
export const ESTIMATE_TTL_MS = 2 * 3600 * 1000;
