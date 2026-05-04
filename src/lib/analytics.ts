// Lehký analytics modul — log-based, ukládá hits do SESSION KV a agreguje při čtení.
// Klíčový vzor:
//   an:log:YYYY-MM-DD:<random>  → JSON entry { ts, path, country, browser, os, ref, hash }
// TTL 31 dní; admin čte přes kv.list({ prefix: "an:log:YYYY-MM-DD:" }).

const PREFIX = "an:log:";
const TTL_SEC = 31 * 24 * 60 * 60; // 31 dní
const HASH_TRUNC = 12;

export interface HitEntry {
  ts: number;          // ms since epoch
  path: string;        // pathname (no query, max 200 chars)
  country: string;     // ISO-2 nebo "??"
  browser: string;     // chrome / firefox / safari / edge / other
  os: string;          // windows / mac / linux / android / ios / other
  ref: string;         // "" pokud není referer / vlastní origin
  hash: string;        // SHA-256(ip + UA), zkráceno na 12 chars (unique visitor id per den)
}

export interface AggregatedHits {
  total: number;
  unique: number;
  topPaths: { path: string; count: number }[];
  topCountries: { country: string; count: number }[];
  topBrowsers: { browser: string; count: number }[];
  topOs: { os: string; count: number }[];
  topReferers: { ref: string; count: number }[];
  hourly: number[]; // 24 hodin v UTC
  recent: HitEntry[]; // posledních 100 (sorted desc by ts)
}

function todayUTC(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function detectBrowser(ua: string): string {
  const u = ua.toLowerCase();
  if (u.includes("edg/")) return "edge";
  if (u.includes("opr/") || u.includes("opera")) return "opera";
  if (u.includes("firefox/")) return "firefox";
  if (u.includes("chrome/")) return "chrome";
  if (u.includes("safari/")) return "safari";
  return "other";
}

export function detectOs(ua: string): string {
  const u = ua.toLowerCase();
  if (u.includes("android")) return "android";
  if (u.includes("iphone") || u.includes("ipad") || u.includes("ipod")) return "ios";
  if (u.includes("windows")) return "windows";
  if (u.includes("mac os")) return "mac";
  if (u.includes("linux")) return "linux";
  return "other";
}

async function hashVisitor(ip: string, ua: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}|${ip}|${ua}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)]
    .slice(0, HASH_TRUNC)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function shouldSkip(path: string): boolean {
  if (path.startsWith("/admin/")) return true;
  if (path.startsWith("/api/admin/")) return true;
  if (path.startsWith("/_pagefind/")) return true;
  if (path.startsWith("/_astro/")) return true;
  if (/\.(png|jpg|jpeg|webp|svg|css|js|json|ico|xml|txt|map|woff2?)$/i.test(path)) return true;
  return false;
}

/** Zaznamenej hit do KV. Volat přes ctx.waitUntil — non-blocking. */
export async function recordHit(
  kv: KVNamespace,
  request: Request,
  url: URL,
  options: { country?: string; salt?: string } = {},
): Promise<void> {
  const path = url.pathname;
  if (shouldSkip(path)) return;

  // Vynechej non-GET, bots ne (CF má vlastní bot detection na network úrovni).
  if (request.method !== "GET") return;

  const ua = request.headers.get("user-agent") ?? "";
  // Na CF Workers je cf-connecting-ip nastavený CF a klient ho nemůže spoofovat;
  // x-forwarded-for je klientský header → fallback by umožnil falšování unique counts.
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";

  const refererRaw = request.headers.get("referer") ?? "";
  let ref = "";
  if (refererRaw) {
    try {
      const refUrl = new URL(refererRaw);
      // Schovej self-referers (same-host).
      if (refUrl.hostname !== url.hostname) ref = refUrl.hostname;
    } catch { /* ignore */ }
  }

  const salt = options.salt ?? "pingu";
  const hash = await hashVisitor(ip, ua, `${salt}:${todayUTC()}`);

  const entry: HitEntry = {
    ts: Date.now(),
    path: path.slice(0, 200),
    country: (options.country ?? "??").slice(0, 4).toUpperCase(),
    browser: detectBrowser(ua),
    os: detectOs(ua),
    ref: ref.slice(0, 80),
    hash,
  };

  const day = todayUTC();
  const id = crypto.randomUUID().slice(0, 8);
  await kv.put(`${PREFIX}${day}:${id}`, JSON.stringify(entry), {
    expirationTtl: TTL_SEC,
  });
}

/** Načte všechny hity ze zadaných dní (UTC). Paginates KV list a batchuje GETy
 *  paralelně přes Promise.all (sekvenční loop dělal 30s+ na 30denním rozsahu). */
export async function getHitsForDays(
  kv: KVNamespace,
  days: string[],
): Promise<HitEntry[]> {
  const all: HitEntry[] = [];
  for (const day of days) {
    let cursor: string | undefined;
    do {
      const list = await kv.list({ prefix: `${PREFIX}${day}:`, cursor, limit: 1000 });
      const values = await Promise.all(list.keys.map((k) => kv.get(k.name)));
      for (const raw of values) {
        if (!raw) continue;
        try {
          all.push(JSON.parse(raw) as HitEntry);
        } catch { /* corrupt entry, skip */ }
      }
      cursor = list.list_complete ? undefined : list.cursor;
    } while (cursor);
  }
  return all;
}

export function dayList(rangeDays: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    out.push(todayUTC(d));
  }
  return out;
}

function topN<T extends string>(map: Map<T, number>, n: number): { key: T; count: number }[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, count }));
}

export function aggregate(hits: HitEntry[], topLimit = 15): AggregatedHits {
  const paths = new Map<string, number>();
  const countries = new Map<string, number>();
  const browsers = new Map<string, number>();
  const os = new Map<string, number>();
  const referers = new Map<string, number>();
  const visitors = new Set<string>();
  const hourly = new Array(24).fill(0) as number[];

  // Filter hours: jen za posledních 24h relativně k now.
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;

  for (const h of hits) {
    paths.set(h.path, (paths.get(h.path) ?? 0) + 1);
    countries.set(h.country, (countries.get(h.country) ?? 0) + 1);
    browsers.set(h.browser, (browsers.get(h.browser) ?? 0) + 1);
    os.set(h.os, (os.get(h.os) ?? 0) + 1);
    if (h.ref) referers.set(h.ref, (referers.get(h.ref) ?? 0) + 1);
    visitors.add(h.hash);
    if (h.ts >= cutoff) {
      const hour = new Date(h.ts).getUTCHours();
      hourly[hour]++;
    }
  }

  const recent = [...hits].sort((a, b) => b.ts - a.ts).slice(0, 100);

  return {
    total: hits.length,
    unique: visitors.size,
    topPaths: topN(paths, topLimit).map((e) => ({ path: e.key, count: e.count })),
    topCountries: topN(countries, topLimit).map((e) => ({ country: e.key, count: e.count })),
    topBrowsers: topN(browsers, topLimit).map((e) => ({ browser: e.key, count: e.count })),
    topOs: topN(os, topLimit).map((e) => ({ os: e.key, count: e.count })),
    topReferers: topN(referers, topLimit).map((e) => ({ ref: e.key, count: e.count })),
    hourly,
    recent,
  };
}
