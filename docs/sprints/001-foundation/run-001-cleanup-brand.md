# Run 001: Cleanup kostra, site config, brand

**Status:** TODO
**Date:** 2026-04-19
**Sprint:** 001-foundation

## Kontext

Čerstvě naklonovaná kostra má v sobě blogovou šablonu, default site config a generické placeholdery. Tento run čistí kostru a nastavuje identitu pingupedia — populárně-naučná encyklopedie tučňáků pro děti i dospělé. Zachovat chceme: `BaseLayout`, SEO komponenty, sitemap, robots, RSS infrastrukturu (RSS se později napojí na články, ne na druhy).

## Zadání

- [ ] Aktualizovat `src/config/site.ts` — name "pingupedia", description, url (placeholder dokud není doména), lang `cs`, author, navLinks pro `/druhy`, `/o-projektu` (zatím mohou vést na neexistující stránky) (mcp — Astro docs: site config conventions)
- [ ] Aktualizovat `astro.config.mjs` — `site` placeholder z `example.com` na `pingupedia.cz` (nebo placeholder), zkontrolovat že Inter font zůstává (mcp — Astro 6 docs: fonts API)
- [ ] Přepsat `src/pages/index.astro` — homepage s jednoduchým hero (titulek, podtitulek, CTA na `/druhy`), bez placeholder kostra obsahu. Obrázek (pokud použit) musí respektovat no-crop pravidlo (tohle nainstalujeme v Run 002 — zatím stačí placeholder text).
- [ ] Přepsat `src/pages/404.astro` — vtipný dětský 404 („Tučňáci odplouli jinam")
- [ ] Aktualizovat `README.md` — jednoduchý popis projektu (pingupedia, co to je), odstranit odkazy na kostra docs co neplatí
- [ ] Rozhodnout o osudu blog kolekce: odstranit `src/content/blog/`, `src/pages/blog/`, `src/pages/rss.xml.js` **NEBO** zachovat a později přestylizovat pro články? → **Výchozí: odstranit, blog se vrátí v Sprint 004 pokud bude potřeba.**
- [ ] Smazat kostra-specific docs: `docs/manual.md`, `docs/step-by-step.md`, `docs/create-admin.md`, `docs/claude-commands.md` (nahradí je PROJECT.md + PLAN.md, které už existují)
- [ ] Ověřit build: `pnpm build` projde bez chyb
- [ ] Ověřit: `pnpm typecheck` projde

## Soubory ke čtení

- `src/config/site.ts` — aktuální site config
- `src/pages/index.astro` — current homepage
- `src/pages/404.astro` — current 404
- `astro.config.mjs` — base site + fonts + adapter
- `src/layouts/BaseLayout.astro` — layout wrapper (pro kontext, tenhle run jeho obsah zásadně nemění)
- `src/content.config.ts` — content collection konfigurace (pro kontext, schema se řeší v Run 003)
- `src/content/blog/` — blog kolekce k odstranění
- `src/pages/blog/` — blog stránky k odstranění
- `README.md` — aktuální README
- `docs/*.md` — kostra docs k úklidu

## Kritéria hotového

- Homepage ukazuje pingupedia brand, ne kostra placeholder
- Blog úplně odstraněn (nebo zachován podle rozhodnutí výše)
- `pnpm build` a `pnpm typecheck` bez chyb
- `git status` čistý, commit s popisem „Run 001: cleanup kostra + pingupedia brand"
