# Run 017: i18n architektura

**Status:** TODO
**Date:** TBD
**Sprint:** 006-i18n-foundation

## Kontext

Pingupedia má aktuálně 8-locale UI dictionary (`src/i18n/ui.ts`) s client-side text overlay (LangSwitcher dropdown + `data-i18n` attributes). Veškerý content (markdown druhů, page JSONs) je pouze v češtině. URL nemají locale prefix.

Tento run zavádí **infrastrukturu pro per-locale content + URL routing**. Žádný překlad obsahu sám o sobě (to dělá Run 018+). Po Run 017 musí build projít, default cs URL fungovat beze změny, `/en/druhy/cisarsky/` vrátit 404 nebo fallback na cs (zatím nemáme EN content).

Cílové jazyky: **cs (primary), en, de, fr, es, it, pl, uk** (8 celkem).

## Zadání

- [ ] **Astro i18n config v `astro.config.mjs`** (mcp) — přidat `i18n: { defaultLocale: 'cs', locales: [...8...], routing: { prefixDefaultLocale: false } }`. Ověřit, že `output: 'server'` + `prerenderEnvironment: 'node'` jsou kompatibilní.
- [ ] **Content collection refactor pro `{slug}.{locale}.md` pattern** (mcp) — `species` collection přidá nepovinný `locale` field získaný z file naming pattern; default `cs` pro `cisarsky.md`, `en` pro `cisarsky.en.md`. Helper `getSpeciesByLocale(slug, locale)` v `src/lib/species-i18n.ts` (~40ř) s fallbackem na cs.
- [ ] **Page collections refactor** (`home`, `hry`, `filmy`, `oProjektu`, `quiz`, `site`) na `{name}.{locale}.json` pattern. Schema rozšíření v `lib/content-schemas.ts` o per-locale `titleHtml` field — buď samostatný field per locale, nebo `Record<Locale, string>`.
- [ ] **Per-locale getStaticPaths** v `src/pages/druhy/[slug].astro` a `src/pages/[locale]/druhy/[slug].astro` (nový soubor pro non-cs). Astro vyžaduje per-locale Astro page; zvážit, jestli stačí jeden `[...slug].astro` s `[locale]` segment, nebo musí být duplikováno. **Plánovat strukturu před implementací.**
- [ ] **Language switcher refactor** v `src/components/layout/LangSwitcher.astro` — místo `data-i18n` overlay mění `window.location.href` na URL s prefixem locale. Persist přes localStorage zachovat (pro initial load), ale source of truth = URL. Update `src/i18n/client.ts` `applyLocale()` aby četla locale z URL prvně, fallback localStorage.
- [ ] **404 fallback pro chybějící per-locale content** — když `/en/druhy/cisarsky/` neexistuje (Run 017 ještě nemá EN content), redirect na `/druhy/cisarsky/` nebo render cs s warning bannerem. Plánovat: middleware vs `getStaticPaths` vrací 404.

## Soubory ke čtení

- `astro.config.mjs` — current config, kam přidat i18n
- `src/content.config.ts` + `src/lib/content-schemas.ts` — schema rozšíření
- `src/pages/druhy/[slug].astro` — současný getStaticPaths
- `src/pages/index.astro`, `src/pages/o-projektu.astro`, `src/pages/hry/index.astro`, `src/pages/filmy/index.astro` — current page rendering, kandidáti na per-locale
- `src/components/layout/LangSwitcher.astro` — refactor target
- `src/i18n/client.ts` — `applyLocale` logika
- `src/i18n/ui.ts` — LOCALES const (zdroj pravdy pro routing config)
- `src/middleware.ts` — možný insertion point pro locale-aware redirects (admin už má auth handling)

## Pre-flight kontrola

Před zápisem kódu (Phase 2 v `/work`):
- Spustit `mcp__context7__query-docs` na `/withastro/docs` s queries: "i18n routing config", "getStaticPaths with locale", "content collections per-locale glob loader"
- Ověřit Astro 6 (^6.1.1) podporuje konstrukce, které plánujeme — pokud verze je starší než nutná, plánovat upgrade samostatně.

## Definition of done

- `pnpm astro check` prochází 0 errors
- `pnpm build` prochází (i kdyby per-locale content ještě neexistoval, infrastruktura musí být připravena pro Run 018)
- Default URLs (`/`, `/druhy/cisarsky/`) fungují beze změny v cs
- `/en/druhy/cisarsky/` vrací buď 404 (preferováno) nebo fallback na cs s warningem (acceptable)
- LangSwitcher přepnutí na EN naviguje na `/en/...` URL, ne jen mění DOM
- Žádné regrese v existujících i18n MVP UI překladech

## Co tento run NEDĚLÁ

- Žádný překlad obsahu (to je Run 018–020)
- Žádné per-locale page bodies (to je Run 020)
- Žádné per-locale druhy markdown body (Run 018+019)
- Žádný human review překladů (mimo plán Sprint 006/007)
