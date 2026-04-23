# Sprint 003: Admin rozhraní

**Status:** in-progress
**Cíl:** Admin rozhraní pro editaci všech textů a obsahu pingupedia. Obsah se edituje přímo v markdown souborech přes GitHub API → commit → CF Workers Build deploy. Autentikace přes heslo v ENV + signed session cookie.

## Scope

pingupedia má obsah ve 3 typech zdrojů:

1. **Markdown druhů** — `src/content/species/*.md` (18 souborů, frontmatter + body)
2. **Hardcoded texty v .astro** — homepage, o-projektu, hry/index, 404 (~50 stringů)
3. **TS data soubory** — `quiz-data.ts`, `site.ts`

Admin umožní editovat vše přes web UI bez přístupu ke kódu, s git historií zachovanou (každá změna = commit).

## Architektura

- **Storage:** GitHub API commits (každý save = PUT contents + commit) — ground truth zůstává git
- **Auth:** `ADMIN_PASSWORD` env var + signed session cookie (HMAC-SHA256 přes Web Crypto API)
- **Routing:** `/admin/*` + `/api/admin/*` všechno SSR (`prerender = false`)
- **Editor:** Pro MVP textarea + prostý form; TipTap přidán v pozdějším runu
- **Deploy:** GitHub commit → CF Workers Build (pokud funguje auto-build) → ~2 min delay; fallback `wrangler deploy`

## Runy

- [x] Run 010 — Bootstrap: auth middleware, login, dashboard skafold → `run-010-admin-bootstrap.done.md`
- [x] Run 011 — GitHub API wrapper + diagnostic UI → `run-011-github-api.done.md`
- [x] Run 012 — `/admin/druhy/` list + raw markdown editor → `run-012-species-edit.done.md`
- [ ] Run 013 — Strukturovaný form pro frontmatter (inputy per pole, array manipulátory) + `/admin/texty/` pro hardcoded stringy
- [ ] Run 014 — TipTap rich editor pro markdown body + R2 image upload (nové gallery fotky)

## Bezpečnostní poznámky

- `ADMIN_PASSWORD` se nastavuje přes `wrangler secret put ADMIN_PASSWORD` (ne v gitu)
- `SESSION_SECRET` 32+ znaků, taky secret
- `GITHUB_TOKEN` fine-grained PAT (contents:write na tomto repu), Run 011+
- Session cookie: httpOnly, secure, SameSite=Lax, 8h expirace
- Rate limit na login endpoint v Run 010 (prevent bruteforce)

## Závislosti

- Run 010 musí být done před všemi ostatními (auth gate)
- Run 011 je nutný pro 012/013/014 (GitHub API wrapper)
- Run 014 závisí na R2 bindingu — přidat do `wrangler.jsonc`
