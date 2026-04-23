# Run 010: Admin bootstrap

**Status:** DONE
**Date:** 2026-04-22
**Sprint:** 003-admin

## Kontext

První run nového Sprint 003. Zavádí autentikační vrstvu a skafold admin sekce. Edit funkce zatím není — přijde v Run 011/012+. Toto jen staví bránu a kostru aby šlo navázat CRUD.

## Zadání

- [x] `src/lib/admin/session.ts` — HMAC-signed session cookie (Web Crypto API, bez externí lib)
- [x] `src/middleware.ts` — auth gate: redirect nelogovaných z `/admin/*` na `/admin/login/`
- [x] `src/layouts/AdminLayout.astro` — sidebar + header + logout
- [x] `src/pages/admin/login.astro` — form POST na `/api/admin/session`
- [x] `src/pages/admin/index.astro` — dashboard s odkazy (placeholder — druhy/texty/fotky)
- [x] `src/pages/api/admin/session.ts` — POST login (validate + set cookie) / DELETE logout
- [x] `.dev.vars.example` + `.dev.vars` gitignored + `App.Locals.isAdmin` type
- [x] Astro check + build 0/0/0 + commit + deploy

## Env vars (secrets)

```bash
# Local dev: .dev.vars (git-ignored)
ADMIN_PASSWORD=change-me-locally
SESSION_SECRET=at-least-32-char-random-string

# Production: wrangler secret
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
```

## Session cookie formát

```
pingupedia_admin=<base64url(payload)>.<base64url(hmac_sha256)>
```

- `payload` = JSON `{exp: unixMs}`
- HMAC klíč: `SESSION_SECRET` env
- Verify na každý request v middleware: re-sign payload, compare MAC constant-time

## Řešení

- **Session helper** (`src/lib/admin/session.ts`, 94 ř) — HMAC-SHA256 přes Web Crypto API, base64url kódování bez deps. `createSessionCookie(secret, ttl)` vrací `{value, maxAgeSec}`, `verifySessionCookie` dělá re-sign + constant-time compare + exp kontrolu. Cookie formát `<b64url(payload)>.<b64url(mac)>` kde payload = `{exp: msUnix}`. Default TTL 8 h.
- **Middleware** (`src/middleware.ts`, 42 ř) — filtr jen na `/admin/*` a `/api/admin/*`, propouští `/admin/login/` a `/api/admin/session`. Čte cookie, verify; nelogovaným redirect na `/admin/login/?next=...` (pro stránky) nebo 401 JSON (pro API). `import("cloudflare:workers")` je **dynamic** — prerender /404 a ostatní SSG stránek bez middleware by jinak failed (Node build nerozumí `cloudflare:` schématu).
- **API /api/admin/session** (POST login / POST action=logout, 57 ř) — validuje `ADMIN_PASSWORD`, vytvoří cookie, redirect na `next` (sanitizovaný proti open redirect). Logout clear cookie + redirect na login.
- **AdminLayout** (54 ř) — dark-only layout, sidebar navigace (dashboard / druhy / texty / fotky), logout button, `noindex/nofollow` meta, reuse global.css pro tokeny.
- **Login page** (`/admin/login/`, 40 ř) — prostý form, chybu zobrazuje `?error=bad-password`.
- **Dashboard** (`/admin/`, 54 ř) — 3 karty (Druhy / Texty / Fotky) + stav nasazení (počet druhů, větev, deploy target). `getCollection('species').length` dynamicky.
- **Placeholder pages** (`/admin/druhy/`, `/admin/texty/`, `/admin/fotky/`) — „skafold připravený" karta, aby linky z dashboardu nekončily 404.
- **Dev env** — `.dev.vars.example` committed, `.dev.vars` git-ignored (`.gitignore` update). `App.Locals.isAdmin` přidán do `src/types/types.d.ts` přes `declare global`.
- **Build pass** — `astro check`, `tsc --noEmit`, `astro build` všechno 0/0/0. Všech 18 druhů + admin skafold prerendered/ssr correctly.

## Poznámky

- **Dynamic `import("cloudflare:workers")`** je nutný — middleware se načítá i při `astro build` pro prerender fázi (v Node env), kde `cloudflare:workers` není resolvovatelné. Statický top-level import shodí celý build. Totéž v `/api/admin/session.ts`.
- **`prerender = false`** je na všech `/admin/*` a `/api/admin/*` — musí běžet v Workers runtime, ne v SSG.
- **Secrets pro produkci** nutné nastavit před prvním pokusem o login:
  ```bash
  wrangler secret put ADMIN_PASSWORD
  wrangler secret put SESSION_SECRET
  ```
  Bez nich middleware vrátí 503 s instrukcemi.
- **Rate limit na login** ještě není (Run 011+ TODO) — dnes je brute force teoreticky možný. Pro single-user admin s náhodným 16+ char heslem je to akceptabilní riziko.
- **Dev server (pnpm dev)** padá s vite dep cache errorem (undici JSON parse) — issue v CF vite plugin 1.30. Build a produkce fungují, testování admin UI se dělá na `.workers.dev` po deploy.
- **Next run (011)** — GitHub API wrapper (fetch-based, bez Octokit): čtení `GET /repos/:owner/:repo/contents/:path`, zápis `PUT /repos/:owner/:repo/contents/:path` s base64 obsahem + SHA pro update. Token v `GITHUB_TOKEN` secret.
