// Per-IP rate limiting přes SESSION KV — pro brute-force login attempts.

const KEY_PREFIX = "rl:login:";
const WINDOW_SEC = 15 * 60;   // 15 min sliding window
const MAX_ATTEMPTS = 5;        // 5 failed attempts per IP per window

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export function clientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

export async function checkLoginRate(
  kv: KVNamespace,
  ip: string,
): Promise<RateLimitResult> {
  const raw = await kv.get(KEY_PREFIX + ip);
  const count = raw ? Number(raw) : 0;
  if (count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, retryAfter: WINDOW_SEC };
  }
  return { allowed: true, remaining: MAX_ATTEMPTS - count, retryAfter: 0 };
}

export async function recordLoginFailure(
  kv: KVNamespace,
  ip: string,
): Promise<void> {
  const key = KEY_PREFIX + ip;
  const raw = await kv.get(key);
  const count = (raw ? Number(raw) : 0) + 1;
  await kv.put(key, String(count), { expirationTtl: WINDOW_SEC });
}

export async function clearLoginRate(
  kv: KVNamespace,
  ip: string,
): Promise<void> {
  await kv.delete(KEY_PREFIX + ip);
}
