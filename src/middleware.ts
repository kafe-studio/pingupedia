import { defineMiddleware } from "astro:middleware";
import { readCookie, verifySessionCookie } from "./lib/admin/session";

const ADMIN_PREFIX = "/admin";
const LOGIN_PATH = "/admin/login/";
const API_ADMIN_PREFIX = "/api/admin/";
const API_SESSION_PATHS = new Set(["/api/admin/session", "/api/admin/session/"]);

const NO_STORE = "private, no-store";

function withNoStore(response: Response): Response {
  response.headers.set("Cache-Control", NO_STORE);
  return response;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  const isAdminPage = pathname === ADMIN_PREFIX || pathname.startsWith(ADMIN_PREFIX + "/");
  const isAdminApi = pathname === API_ADMIN_PREFIX.slice(0, -1) || pathname.startsWith(API_ADMIN_PREFIX);

  if (!isAdminPage && !isAdminApi) return next();

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
