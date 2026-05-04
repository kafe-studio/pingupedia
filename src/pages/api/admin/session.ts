import type { APIRoute } from "astro";
import {
  buildClearCookie,
  buildSetCookie,
  constantTimeEqualString,
  createSessionCookie,
  isSameOriginRequest,
} from "../../../lib/admin/session";
import {
  checkLoginRate,
  clearLoginRate,
  clientIp,
  recordLoginFailure,
} from "../../../lib/admin/rate-limit";

export const prerender = false;

function sanitizeNext(raw: unknown): string {
  if (typeof raw !== "string") return "/admin/";
  // Některé prohlížeče interpretují `\` jako `/` při parsingu Location → `/\evil.com`
  // by se z `/admin/login` redirectovalo na cizí origin. Normalizuj a poté odmítni
  // protocol-relative paths.
  const normalized = raw.replace(/\\/g, "/");
  if (!normalized.startsWith("/") || normalized.startsWith("//")) return "/admin/";
  // Whitelist znaků v URL — žádný kontrolní znak, pouze běžné path/query bezpečné.
  if (!/^\/[A-Za-z0-9/?&=._~%-]*$/.test(normalized)) return "/admin/";
  return normalized;
}

function loginRedirect(url: URL, error: string, next: string): Response {
  const target = new URL("/admin/login/", url);
  target.searchParams.set("error", error);
  if (next !== "/admin/") target.searchParams.set("next", next);
  return new Response(null, { status: 302, headers: { Location: target.pathname + target.search } });
}

export const POST: APIRoute = async ({ request, url }) => {
  if (!isSameOriginRequest(request, url)) {
    return new Response("Forbidden", { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response("Invalid form data", { status: 400 });
  }
  const action = form.get("action");
  const secure = url.protocol === "https:";

  const { env } = await import("cloudflare:workers");
  const adminEnv = env as {
    ADMIN_PASSWORD?: string;
    SESSION_SECRET?: string;
    SESSION?: KVNamespace;
  };

  if (action === "logout") {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/admin/login/",
        "Set-Cookie": buildClearCookie(secure),
      },
    });
  }

  if (action !== "login") {
    return new Response("Bad request", { status: 400 });
  }

  const password = form.get("password");
  const next = sanitizeNext(form.get("next"));

  if (!adminEnv.ADMIN_PASSWORD || !adminEnv.SESSION_SECRET) {
    return new Response(
      "Admin je nenakonfigurovaný — chybí ADMIN_PASSWORD nebo SESSION_SECRET.",
      { status: 503 },
    );
  }

  // Per-IP rate limit — 5 failed attempts / 15 min. SESSION KV chybí jen v dev fallbacku.
  const ip = clientIp(request);
  if (adminEnv.SESSION) {
    const rate = await checkLoginRate(adminEnv.SESSION, ip);
    if (!rate.allowed) {
      return new Response(
        "Příliš mnoho pokusů o přihlášení. Zkus to za chvíli znovu.",
        {
          status: 429,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Retry-After": String(rate.retryAfter),
          },
        },
      );
    }
  }

  if (typeof password !== "string" || !(await constantTimeEqualString(password, adminEnv.ADMIN_PASSWORD))) {
    if (adminEnv.SESSION) await recordLoginFailure(adminEnv.SESSION, ip);
    return loginRedirect(url, "bad-password", next);
  }

  if (adminEnv.SESSION) await clearLoginRate(adminEnv.SESSION, ip);

  const { value, maxAgeSec } = await createSessionCookie(adminEnv.SESSION_SECRET);
  return new Response(null, {
    status: 302,
    headers: {
      Location: next,
      "Set-Cookie": buildSetCookie(value, maxAgeSec, secure),
    },
  });
};
