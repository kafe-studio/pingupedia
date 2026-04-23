import { defineMiddleware } from "astro:middleware";
import { readCookie, verifySessionCookie } from "./lib/admin/session";

const ADMIN_PREFIX = "/admin";
const LOGIN_PATH = "/admin/login/";
const API_ADMIN_PREFIX = "/api/admin";
const API_SESSION_PATH = "/api/admin/session";

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  const isAdminPage = pathname === ADMIN_PREFIX || pathname.startsWith(ADMIN_PREFIX + "/");
  const isAdminApi = pathname.startsWith(API_ADMIN_PREFIX);

  if (!isAdminPage && !isAdminApi) return next();

  if (pathname === LOGIN_PATH || pathname === API_SESSION_PATH) {
    return next();
  }

  const { env } = await import("cloudflare:workers");
  const secret = (env as { SESSION_SECRET?: string }).SESSION_SECRET;
  if (!secret) {
    return new Response(
      "Admin je nedostupný: chybí SESSION_SECRET env var (nastav `wrangler secret put SESSION_SECRET`).",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  const cookie = readCookie(context.request.headers.get("cookie"));
  const ok = await verifySessionCookie(secret, cookie);
  if (ok) {
    context.locals.isAdmin = true;
    return next();
  }

  if (isAdminApi) {
    return new Response(JSON.stringify({ error: "unauthenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const target = new URL(LOGIN_PATH, context.url);
  if (pathname !== ADMIN_PREFIX + "/") {
    target.searchParams.set("next", pathname);
  }
  return context.redirect(target.pathname + target.search, 302);
});
