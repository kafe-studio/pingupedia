# Run 017a: i18n základy

**Status:** TODO
**Date:** 2026-04-27
**Sprint:** 006-i18n-foundation
**Dashboard Run:** 194

<!-- dashboard-tasks: {"MCP docs research: Astro i18n + glob loader": 883, "Astro i18n config v astro.config.mjs": 884, "Schema rozšíření: per-locale titleHtml": 885, "Species i18n helper modul + refactor species-of-day": 886} -->

## Kontext

Run 017 původně obsahoval 6 itemů — config, schema, content collection refactor, per-locale getStaticPaths, LangSwitcher refactor, 404 fallback. To je nad limit `/work` runu (max 5 items) a logicky se dělí:

- **017a (tento run)** — infrastruktura datové vrstvy: i18n config, schema, helper modul. Build prochází, default cs URL fungují beze změny, žádné per-locale page rendering ještě neaktivní.
- **017b (next run)** — page routing vrstva: per-locale getStaticPaths napříč stránkami, LangSwitcher URL-based, 404 fallback. EN URL `/en/druhy/cisarsky/` začne fungovat (s cs fallback obsahem dokud Run 018 nedoplní EN).

Tento run NEDĚLÁ žádný překlad obsahu.

Cílové jazyky: **cs (primary), en, de, fr, es, it, pl, uk** (8 celkem).

## Zadání

- [ ] **MCP docs research** (mcp) — `mcp__plugin_kafe-stack_context7__query-docs` na `/withastro/docs` s queries: "i18n routing config", "content collections glob loader", "getStaticPaths". Cíl: ověřit Astro 6 (^6.1.1) podporuje `i18n.routing.prefixDefaultLocale`, jak glob loader matchuje `{slug}.{locale}.md` patterns, jak helper extrahuje locale ze souboru.
- [ ] **Astro i18n config** v `astro.config.mjs` (mcp) — přidat `i18n: { defaultLocale: 'cs', locales: [...8...], routing: { prefixDefaultLocale: false } }`. Ověřit, že `output: 'server'` + cloudflare adapter fungují společně s i18n.
- [ ] **Schema rozšíření per-locale titleHtml** v `lib/content-schemas.ts` (mcp) — `titleHtml` v `homeSchema`, `oProjektuSchema`, `hrySchema`, `filmySchema` přepsat na buď `z.string()` (zachovat backward-compat pro cs) NEBO `z.union([z.string(), z.record(z.string())])` (per-locale map). Volba podle MCP best practice — preferovat backward-compat.
- [ ] **Species i18n helper** (bp) — nový `src/lib/species-i18n.ts` (~60ř) s exporty:
  - `parseLocaleFromId(id: string): { slug: string; locale: Locale }` — `cisarsky.en` → `{slug: "cisarsky", locale: "en"}`, `cisarsky` → `{slug: "cisarsky", locale: "cs"}`
  - `getSpeciesByLocale(slug: string, locale: Locale)` — najde entry, fallback na cs
  - Update `src/lib/species-of-day.ts` aby `sortedSpecies` filtrovalo jen `locale === "cs"` (default), nebo přijímalo locale parameter

## Soubory ke čtení

- `astro.config.mjs` — current config
- `src/content.config.ts` — species + page collections
- `src/lib/content-schemas.ts` — Zod schemas pro pages
- `src/lib/species-of-day.ts` — current sortedSpecies helper
- `src/i18n/ui.ts` — LOCALES const

## Pre-flight (Phase 2)

`mcp__plugin_kafe-stack_context7__query-docs` na `/withastro/docs`:
- "i18n routing config defaultLocale prefixDefaultLocale"
- "content collections glob loader"
- "getStaticPaths locale"

Pokud Astro 6 nepodporuje plánované API, dokumentovat omezení a upravit plán uvnitř runu (NE vytvářet další split).

## Definition of done

- `pnpm astro check` prochází 0 errors
- `pnpm build` prochází (žádné per-locale soubory ještě nejsou — schema musí buď zůstat string-only, nebo akceptovat existující JSONy)
- Default URLs (`/`, `/druhy/cisarsky/`) fungují beze změny v cs
- `parseLocaleFromId("cisarsky.en")` vrátí `{slug: "cisarsky", locale: "en"}`
- `parseLocaleFromId("cisarsky")` vrátí `{slug: "cisarsky", locale: "cs"}`
- `getSpeciesByLocale("cisarsky", "en")` fallbackuje na cs (žádný EN content ještě neexistuje)

## Co tento run NEDĚLÁ

- Žádný page refactor (`[slug].astro` zůstává cs-only) — to je 017b
- Žádný LangSwitcher URL refactor — to je 017b
- Žádný překlad obsahu — to je Run 018+
- Žádné per-locale `home.en.json` apod. — schema je připravená, ale data neexistují

## Návaznost

Run 017b — page routing + switcher + 404 fallback (založí EN URL infrastrukturu)
