# Run 001: Cleanup kostra, site config, brand

**Status:** DONE
**Date:** 2026-04-19
**Sprint:** 001-foundation
**Dashboard Run:** 11
**Session:** První run projektu — cleanup kostra šablony a nasazení pingupedia brandu.

<!-- dashboard-tasks: {"Aktualizovat siteConfig + astro.config.mjs (pingupedia brand)": 45, "Redesign homepage + 404 (pingupedia hero, detsky 404)": 46, "Odstranit blog artefakty + upravit content.config.ts": 47, "README cleanup + smazat kostra docs": 48, "Build + typecheck verify": 49} -->

## Kontext

Čerstvě naklonovaná kostra obsahovala blogovou šablonu, default site config a generické placeholdery. Tento run čistí kostru a nastavuje identitu pingupedia — populárně-naučná encyklopedie tučňáků pro děti i dospělé. Zachováno: `BaseLayout`, `Navbar`, `Footer`, SEO komponenty, `robots.txt`, sitemap integrace. Blog odstraněn celý včetně RSS (vrátí se s novým obsahem v případném budoucím Sprintu).

## Zadání

- [x] Aktualizovat `src/config/site.ts` — pingupedia brand
- [x] Aktualizovat `astro.config.mjs` — site placeholder pingupedia.cz
- [x] Přepsat `src/pages/index.astro` — hero s CTA na /druhy
- [x] Přepsat `src/pages/404.astro` — dětský „Tučňáci odplouli jinam"
- [x] Aktualizovat `README.md`
- [x] Odstranit blog kolekci a RSS
- [x] Smazat kostra docs
- [x] Build + typecheck bez chyb

## Řešení

- **siteConfig** (`src/config/site.ts`) — přepsáno: `name: "pingupedia"`, description dvouvětá definice projektu, `url: https://pingupedia.cz/`, navLinks směřují na `/druhy/` a `/o-projektu/` (záměrně neexistující — vzniknou v následujících runech). Pole `phone`, `email`, `address` ponechána prázdná (projekt nemá firemní kontakt).
- **astro.config.mjs** — pouze změněno `site` z `https://example.com/` na `https://pingupedia.cz/`. Inter font via `fontProviders.fontsource()` zachován beze změny.
- **index.astro** — hero 80vh: h1 „pingupedia", dva populárně-naučné paragrafy („Encyklopedie tučňáků — všech 18 druhů…" / „Fotky, mapy, historie, ověřené zdroje…"), 2 CTA (`btn-primary` → `/druhy/`, `btn-outline` → `/o-projektu/`). Reveal animace z `BaseLayout` ponechány.
- **404.astro** — text „Tučňáci odplouli jinam" + „Tuhle stránku jsme nenašli. Možná ji odnesl proud, možná nikdy neexistovala.", CTA „Zpět na pevninu".
- **README.md** — přepsáno na stručný popis projektu, tech stack, scripts a odkazy na `docs/PROJECT.md`, `docs/PLAN.md`, `docs/sprints/`.
- **Blog odstraněn** — `src/content/blog/`, `src/pages/blog/`, `src/pages/rss.xml.js`, `src/content.config.ts` (byl jen pro blog kolekci). Navazující: odstraněn RSS `<link rel="alternate">` v `src/components/seo/Seo.astro:37`.
- **Kostra docs smazány** — `docs/manual.md`, `docs/step-by-step.md`, `docs/create-admin.md`, `docs/claude-commands.md`.
- **Verifikace** — `pnpm typecheck` + `pnpm build` prošly: 0 errors, 0 warnings, 0 hints. Prerender vygeneroval `/`, `/404.html`, `/robots.txt`.

## Poznámky

- **Context7 kvóta vyčerpána** — `mcp__plugin_kafe-stack_context7__*` vrací `Monthly quota exceeded` (obnova 1. 5. 2026). MCP ověření Astro content collections proběhlo fallbackem přes `node_modules/astro/dist/content/utils.js:558-561` (content.config je optional).
- **Schema.astro** — má unused větev `BlogPosting` (viz `src/components/seo/Schema.astro:31-52`), nepoužívá se nikde. Nechávám jako TODO pro Sprint 002 (přepsat na `Article` pro detail druhu).
- **`.claude/context7-libs.md`** — vytvořeno v předchozím `/context7-init` runu, obsahuje resolvované IDs pro astro/tailwind/typescript. Vitest/wrangler/cloudflare čekají na obnovu kvóty.
- Před Run 002 existují jen 3 routy: `/`, `/404.html`, `/robots.txt`. Stránky `/druhy/`, `/o-projektu/` zatím neexistují (navLinks na ně vedou záměrně — vzniknou v dalších sprintech).
