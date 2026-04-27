# Run 017a: i18n základy

**Status:** DONE
**Date:** 2026-04-27
**Sprint:** 006-i18n-foundation
**Dashboard Run:** 194

<!-- dashboard-tasks: {"MCP docs research: Astro i18n + glob loader": 883, "Astro i18n config v astro.config.mjs": 884, "Schema rozšíření: per-locale titleHtml": 885, "Species i18n helper modul + refactor species-of-day": 886} -->

## Zadání

- MCP docs research: Astro i18n + glob loader
- Astro i18n config v `astro.config.mjs`
- Page collections per-locale glob patterns + schema review (původně "Schema rozšíření titleHtml" — reinterpretován)
- Species i18n helper modul + refactor species-of-day

## Řešení

- MCP research → 3× `mcp__context7__query-docs` na `/withastro/docs` (i18n routing, glob loader, getStaticPaths internationalization)
- Astro i18n config → `astro.config.mjs:21-28`: 8 locales, prefixDefaultLocale: false, redirectToDefaultLocale: false
- Page collections → `src/content.config.ts:124-170`: pattern array `["X.json", "X.*.json"]` per page collection (home/oProjektu/hry/quiz/filmy/site)
- Species i18n helper → nový `src/lib/species-i18n.ts` (75ř): parseLocaleFromId, filterByLocale, getSpeciesByLocale, getAllSpeciesByLocale, parsePageId
- species-of-day refactor → `src/lib/species-of-day.ts:18,31`: pickSpeciesOfDay/sortedSpecies přijímají optional `locale` param (default cs)

## Poznámky

- Schema rozšíření titleHtml NEBYLO potřeba — vize A (per-locale soubor `home.en.json` má vlastní string `titleHtml`) je čistší než vize B (Record<Locale, string> v jednom souboru). Schema fields zůstávají string-only, per-locale řešen filesystem-level.
- Run 017 původně 6 itemů — split na 017a (data layer) + 017b (page routing) kvůli max 5 limit per `/work`.
- LOCALES duplikováno v `astro.config.mjs:10` — TS const tuple z `src/i18n/ui.ts` nelze importovat do `.mjs` configu (sync zajištěn komentářem).
