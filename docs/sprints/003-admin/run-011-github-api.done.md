# Run 011: GitHub API wrapper

**Status:** DONE
**Date:** 2026-04-23
**Sprint:** 003-admin
**Dashboard Run:** 27
**Dashboard Sprint:** 5

<!-- dashboard-tasks: {"github.ts wrapper (getFile/putFile + base64 UTF-8) (bp)": 119, "content-paths.ts logical ID resolver": 120, "api/admin/github/status.ts diagnostic endpoint": 121, "admin/github/index.astro diagnostic UI": 122, "Astro check + build + commit + deploy": 123} -->

## Kontext

Run 010 postavil auth + skafold admin UI. Tento run dodá **čtení a zápis** markdown souborů přes GitHub REST API, aby šlo v Run 012+ editovat obsah přímo z admin rozhraní → commit na `main` → CF Workers Build (nebo manual `wrangler deploy`) nasadí změny.

Proč vlastní wrapper a ne Octokit: Octokit je ~1 MB a má Node-only deps. CF Workers runtime potřebuje fetch-based lib. Naše API je minimalistické (2 endpointy: GET/PUT contents) — 130 řádků stačí.

## Zadání

- [x] `src/lib/admin/github.ts` — `getFile(path)`, `putFile(path, content, message, sha?)`, `getRateLimit()`, UTF-8 safe base64, `GitHubError` (bp)
- [x] `src/lib/admin/content-paths.ts` — mapping logický ID → repo cesta pro species/page/quiz/site
- [x] `src/pages/api/admin/github/status.ts` — GET JSON endpoint s rate limit + sample file + error handling
- [x] `src/pages/admin/github/index.astro` — admin diagnostika, external `github-status-client.ts` kvůli Astro `{}` parsing
- [x] `.dev.vars.example` + `wrangler.jsonc` vars + link z dashboardu

## Secrets (produkce)

```bash
# Create fine-grained PAT at https://github.com/settings/personal-access-tokens
# Repo: kafe-studio/pingupedia  |  Permissions: Contents (read+write)
pnpm wrangler secret put GITHUB_TOKEN
```

Plus nové env vars v `.dev.vars` / `wrangler.jsonc vars`:
- `GITHUB_OWNER=kafe-studio`
- `GITHUB_REPO=pingupedia`
- `GITHUB_BRANCH=main` (default)

## API design

```ts
// src/lib/admin/github.ts
interface GitHubFile { content: string; sha: string; size: number; }
interface GitHubClient {
  getFile(path: string): Promise<GitHubFile | null>;      // null = 404
  putFile(path: string, content: string, message: string, sha?: string): Promise<{ sha: string; commitSha: string }>;
  getRateLimit(): Promise<{ limit: number; remaining: number; resetAt: Date }>;
}
function createGitHubClient(env: Env): GitHubClient;
```

Errors throw `GitHubError` (status, message, response body) — caller rozhodne.

## Řešení

- **GitHub client** (`src/lib/admin/github.ts`, 146 ř) — factory `createGitHubClient(config)` → `{getFile, putFile, getRateLimit}`. UTF-8 base64 přes `TextEncoder` + `btoa`. Headers `Authorization: Bearer`, `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`, `User-Agent: pingupedia-admin/1.0` (bez UA GitHub odmítne). `getFile` vrací `null` na 404 (jinak throw). `putFile` bere optional `sha` pro update (bez sha = create).
- **Content paths** (`src/lib/admin/content-paths.ts`, 39 ř) — `ContentKind = "species" | "page" | "quiz" | "site"`, `parseContentId("species/cisarsky")` → `{kind, slug}`, `toRepoPath({kind, slug})` → `"src/content/species/cisarsky.md"`. `toLogicalId` pro reverse (zatím jen species).
- **Diagnostic API** (`src/pages/api/admin/github/status.ts`, 76 ř) — GET vrací JSON: pokud chybí env vars → `{configured: false, missing: [...]}`, jinak rate limit + sample file (`cisarsky.md`). Error z GitHub throws GitHubError → status 200 s `error` field (diagnostika vždy 200, ať klient může rozhodnout).
- **Diagnostic UI** (`src/pages/admin/github/index.astro`, 39 ř) + **client** (`github-status-client.ts`, 77 ř) — fetch `/api/admin/github/status`, render JSON dump + human summary (missing / error / ok states). Help sekce s instrukcemi na `wrangler secret put`. Externí TS modul místo inline scriptu kvůli Astro parseru (`{...}` v template literálech JSON throw).
- **Config** — `wrangler.jsonc` vars (GITHUB_OWNER/REPO/BRANCH plain, non-secret), `.dev.vars.example` s placeholderem `GITHUB_TOKEN`. Link z `/admin/` dashboardu na diagnostiku.
- **Verifikace** — `astro check` 0/0/0 (66 files), `astro build` prerenduje staticky všech 18 druhů + SSR admin routes včetně nového `/admin/github/` a `/api/admin/github/status`.

## Poznámky

- **Review WARNINGy** (non-blocking):
  - `github.ts:65` fetch bez AbortController/timeout — TODO pro Run 012 `putFile` (10s timeout)
  - `github.ts:103` type cast bez runtime shape check — pragmatický, GitHub API response shape stabilní
  - `content-paths.ts:26` `page` kind neumí subdir slugs (`hry/kviz.astro`) — rozšířit v Run 013 když začneme editovat ne-flat stránky
- **Env vars pro produkci** — uživatel musí ještě nastavit `GITHUB_TOKEN` (fine-grained PAT, Contents read+write na `kafe-studio/pingupedia`). Plus ADMIN_PASSWORD + SESSION_SECRET z Run 010. Bez nich `/admin/*` vrací 503.
- **Next run (012)** — admin formuláře pro edit jednoho druhu. `/admin/druhy/` seznam + `/admin/druhy/[slug]/edit` form → POST na `/api/admin/species/[slug]` → `github.putFile`. Budu muset vyřešit YAML frontmatter parsing — pravděpodobně `yaml` lib nebo custom minimal parser (já preferuju druhé — projekt je malý).
- **Dashboard Run 27**, tasks 119–123 všechny `done`.
