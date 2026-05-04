import { defineMiddleware } from "astro:middleware";
import { readCookie, verifySessionCookie } from "./lib/admin/session";
import { recordHit } from "./lib/analytics";

const ADMIN_PREFIX = "/admin";
const LOGIN_PATH = "/admin/login/";
const API_ADMIN_PREFIX = "/api/admin/";
const API_SESSION_PATHS = new Set(["/api/admin/session", "/api/admin/session/"]);

const NO_STORE = "private, no-store";

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; " +
    "script-src-elem 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https:; " +
    "media-src 'self' data: blob: https:; " +
    "worker-src 'self' blob:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'; " +
    "upgrade-insecure-requests",
};

function applySecurity(response: Response): Response {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (!response.headers.has(k)) response.headers.set(k, v);
  }
  return response;
}

function withNoStore(response: Response): Response {
  response.headers.set("Cache-Control", NO_STORE);
  return applySecurity(response);
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  const isAdminPage = pathname === ADMIN_PREFIX || pathname.startsWith(ADMIN_PREFIX + "/");
  const isAdminApi = pathname === API_ADMIN_PREFIX.slice(0, -1) || pathname.startsWith(API_ADMIN_PREFIX);

  if (!isAdminPage && !isAdminApi) {
    // Záznam návštěvy do KV — non-blocking přes ctx.waitUntil (až do dokončení response).
    try {
      const { env } = await import("cloudflare:workers");
      const kv = (env as { SESSION?: KVNamespace }).SESSION;
      if (kv) {
        const country = (context.request as Request & { cf?: { country?: string } }).cf?.country;
        const promise = recordHit(kv, context.request, context.url, { country });
        // ctx.waitUntil pokud existuje (Cloudflare Workers); jinak fire-and-forget.
        const ctx = (context.locals as { runtime?: { ctx?: { waitUntil?: (p: Promise<unknown>) => void } } }).runtime?.ctx;
        if (ctx?.waitUntil) ctx.waitUntil(promise);
        else void promise.catch(() => { /* swallow */ });
      }
    } catch { /* never block render on analytics */ }
    return applySecurity(await next());
  }

  if (pathname === LOGIN_PATH || API_SESSION_PATHS.has(pathname)) {
    return withNoStore(await next());
  }

  const { env } = await import("cloudflare:workers");
  const secret = (env as { SESSION_SECRET?: string }).SESSION_SECRET;
  if (!secret) {
    return withNoStore(
      new Response(
        "Admin je nedostupný: chybí SESSION_SECRET env var (nastav `wrangler secret put SESSION_SECRET`).",
        { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } },
      ),
    );
  }

  const cookie = readCookie(context.request.headers.get("cookie"));
  const ok = await verifySessionCookie(secret, cookie);
  if (ok) {
    context.locals.isAdmin = true;
    return withNoStore(await next());
  }

  if (isAdminApi) {
    return withNoStore(
      new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }

  const target = new URL(LOGIN_PATH, context.url);
  if (pathname !== ADMIN_PREFIX + "/") {
    target.searchParams.set("next", pathname);
  }
  return withNoStore(context.redirect(target.pathname + target.search, 302));
});
