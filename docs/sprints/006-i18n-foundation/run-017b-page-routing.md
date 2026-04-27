# Run 017b: i18n page routing

**Status:** TODO
**Date:** TBD
**Sprint:** 006-i18n-foundation

## Kontext

Run 017a postavil data layer i18n: `astro.config.mjs` má `i18n` block s 8 locales (cs default, prefixDefaultLocale: false), page collections matchují per-locale glob patterns (`home.json` + `home.*.json`), helper modul `src/lib/species-i18n.ts` umí parsovat id, filtrovat per locale, fallbackovat na cs.

Tento run dotahuje **page routing vrstvu** — per-locale URL musí fungovat end-to-end. Po dokončení `/en/druhy/cisarsky/` vrátí buď EN content (až Run 018 doplní), nebo cs fallback s warningem; LangSwitcher přepne URL místo DOM overlay; 404 strategie je definována.

Žádný překlad obsahu — to je Run 018+.

## Zadání

- [ ] **Per-locale getStaticPaths** v `src/pages/druhy/[slug].astro` (mcp) — rozhodnout strukturu: jeden soubor s `[locale]` segment NEBO duplikovat na `src/pages/[locale]/druhy/[slug].astro` pro non-cs. Astro recipe používá `src/pages/[lang]/blog/[...slug].astro` pattern. **Plánovat strukturu před implementací.** getStaticPaths generuje cesty pro každý {locale, slug} pár (8 × 18 = 144 paths), používá `getSpeciesByLocale` z 017a helperu.
- [ ] **Per-locale homepage** `src/pages/index.astro` + `src/pages/[locale]/index.astro` (mcp) — podobně jako druhy. Použít `parsePageId` helper na home collection entries, nebo specifický `getEntry("home", "home.en")` per locale.
- [ ] **Ostatní stránky** (`hry`, `filmy`, `o-projektu`) — buď stejný per-locale pattern, nebo 017c později. **Rozhodni v Phase 1 plan.**
- [ ] **Language switcher refactor** v `src/components/layout/LangSwitcher.astro` + `src/i18n/client.ts` (mcp) — místo `data-i18n` DOM overlay nastaví `window.location.href` na URL s prefixem locale. Persist přes localStorage zachovat (initial fallback), ale source of truth = URL. `applyLocale()` v `src/i18n/client.ts` čte locale z `Astro.currentLocale` (server) nebo z URL path (client).
- [ ] **404 fallback strategie** — když `/en/druhy/cisarsky/` neexistuje (Run 017b ještě nemá EN content), 3 možnosti:
  - (a) `getStaticPaths` vrátí jen cs paths → ostatní vrátí 404
  - (b) Render cs content s WARN bannerem (DX worse, SEO problém)
  - (c) `Astro.redirect("/druhy/cisarsky/")` na cs ekvivalent (preferováno)
  Doporučení: (c) — implementovat v `src/middleware.ts` nebo přímo v `[slug].astro`.

## Soubory ke čtení

- `src/pages/druhy/[slug].astro` — current cs-only getStaticPaths
- `src/pages/druhy/index.astro` — list stránka, taky bude potřebovat per-locale
- `src/pages/index.astro` — homepage
- `src/components/layout/LangSwitcher.astro` — current DOM overlay
- `src/i18n/client.ts` — current applyLocale logic
- `src/middleware.ts` — possible 404 fallback insertion point
- `src/lib/species-i18n.ts` — helper modul z 017a
- `src/lib/pages.ts` — getEntry helpers pro page collections

## Pre-flight (Phase 2)

`mcp__context7__query-docs` na `/withastro/docs`:
- "Astro.currentLocale i18n routing"
- "getStaticPaths multiple dynamic params locale slug"
- "Astro.redirect from page i18n fallback"

## Definition of done

- `pnpm astro check` 0 errors, `pnpm build` prochází
- Default URLs (`/`, `/druhy/cisarsky/`) fungují beze změny v cs
- `/en/druhy/cisarsky/` fungují (cs fallback content nebo redirect dokud Run 018 nedoplní EN)
- LangSwitcher přepnutí na EN naviguje na `/en/...` URL, ne mění DOM
- Žádné regrese v existujících UI překladech (data-i18n overlay zachován pro elementy mimo per-locale page rendering)
- 404 fallback strategie je dokumentovaná a funguje pro všech 8 locales

## Co tento run NEDĚLÁ

- Žádný překlad obsahu (Run 018+)
- Žádné per-locale `home.en.json` apod. soubory (Run 020)
- Žádná hreflang / sitemap per-locale logika (Run 020 audit nebo Sprint 008)

## Návaznost

Run 018 — EN pilot 4 druhy (cisarsky, brylovy, krouzkovy, osli) frontmatter + body, ověření E2E pipeline.
