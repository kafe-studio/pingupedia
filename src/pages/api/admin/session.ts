import type { APIRoute } from "astro";
import {
  buildClearCookie,
  buildSetCookie,
  createSessionCookie,
} from "../../../lib/admin/session";

export const prerender = false;

function sanitizeNext(raw: unknown): string {
  if (typeof raw !== "string") return "/admin/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/admin/";
  return raw;
}

function loginRedirect(url: URL, error: string, next: string): Response {
  const target = new URL("/admin/login/", url);
  target.searchParams.set("error", error);
  if (next !== "/admin/") target.searchParams.set("next", next);
  return new Response(null, { status: 302, headers: { Location: target.pathname + target.search } });
}

export const POST: APIRoute = async ({ request, url }) => {
  const form = await request.formData();
  const action = form.get("action");
  const secure = url.protocol === "https:";

  const { env } = await import("cloudflare:workers");
  const adminEnv = env as { ADMIN_PASSWORD?: string; SESSION_SECRET?: string };

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

  if (typeof password !== "string" || password !== adminEnv.ADMIN_PASSWORD) {
    return loginRedirect(url, "bad-password", next);
  }

  const { value, maxAgeSec } = await createSessionCookie(adminEnv.SESSION_SECRET);
  return new Response(null, {
    status: 302,
    headers: {
      Location: next,
      "Set-Cookie": buildSetCookie(value, maxAgeSec, secure),
    },
  });
};
