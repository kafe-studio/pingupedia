# Run 013d: O projektu jako content collection + admin form

**Status:** DONE
**Date:** 2026-04-24
**Sprint:** 003-admin
**Dashboard Run:** 170

<!-- dashboard-tasks: {"O projektu jako content collection + helper": 773, "Refaktor stranky o-projektu na cteni z JSON": 774, "Admin form pro editaci o-projektu": 775, "Client pro submit o-projektu formulare": 776, "Verifikace, build a deploy": 777} -->

## Kontext

Pattern z Run 013b/c (site, homepage) aplikovaný na stránku `/o-projektu/`. Stránka má 8 bento karet se sekcemi: Záměr, Cílová skupina, Zdroje obsahu, Pravidla obrázků, Statistiky, Technicky, 2× CTA. Dynamické countery (`speciesCount`, `genusCount`) zůstanou computed v template, JSON má jen labels + static hodnoty.

## Design

### Schema

Samostatná `oProjektu` kolekce. Dynamické stat items označené `dynamic: "species" | "genus"`, ostatní mají `value: string`. Template vybere jeden nebo druhý:

```ts
const value = item.dynamic === "species" ? speciesCount
  : item.dynamic === "genus" ? genusCount
  : item.value;
```

Rich HTML v `imageRules` bulletech renderované přes `set:html` (stejný pattern jako homepage titlů).

## Zadání

- [x] `src/content/pages/o-projektu.json` (68 ř) + `oProjektu` kolekce + `getOProjektuPage()`
- [x] `src/pages/o-projektu.astro` refaktor (118 ř), `statValue()` helper pro dynamic countery
- [x] `src/pages/admin/texty/o-projektu.astro` 11-sekcí form (260 ř)
- [x] `src/lib/admin/o-projektu-form-client.ts` (154 ř) s parsery pro stats `@species`/`@genus` + HTML bullety `\n---\n`
- [x] Astro check + build 0/0/0 + `/admin/texty/` entry → ready

## Řešení

- **JSON** (68 ř) — 10 sekcí: meta, hero, purpose, audience, sources, imageRules, stats, tech, catalogCta, gamesCta. HTML v subtitle/body jako raw string (entity `&nbsp;`, `<strong>`, `<code>`).
- **Schema** — `z.union([{dynamic}, {value}])` pro `stats.items` rozlišuje dynamic vs. static. `z.enum(["species", "genus"])` restrict.
- **Helper** — `getOProjektuPage()` identický pattern s `getHomePage()`, 8 ř.
- **Page refaktor** — `statValue(item)` narrowing přes `"dynamic" in item`, `set:html` pro HTML fragmenty (hero.subtitle, purpose.body, imageRules.itemsHtml, tech.body).
- **Admin form** — 11 sekcí, parsery pro stats jako `Label | Hodnota` nebo `Label | @species/@genus`, HTML bullety oddělené `\n---\n` (multiline HTML per bullet).
- **Index** — entry `page/o-projektu` z `soon` na `ready` + href.

## Poznámky

- **Review WARNINGy (3, non-blocking):**
  - `o-projektu-form-client.ts:55` — local `val` const stíní outer `val()` helper (shadowing, funkčnost OK).
  - `o-projektu-form-client.ts:62` — `line.split("|")` selže při `|` v labelu (stejný trade-off jako site/home).
  - `o-projektu.json:36` — hardcoded „18 hero + ~50 gallery" čísla v imageRules bullet; admin musí ručně upravit při změně.
- **Bez MCP searches** — 100% pattern-reuse. Build + typecheck jsou autoritativní pro API správnost.
- **Dashboard:** Run 170 po /init, tasky 773-777 (`done` po deploy).
- **Sprint 003 stav:** 6/10 runů (010, 011, 012, 013a, 013b, 013c, 013d = 7 total; zbývá 013e hry+kvíz, 013f species gallery, 014 TipTap+R2).
