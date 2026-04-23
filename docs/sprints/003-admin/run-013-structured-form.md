# Run 013: Strukturovaný form druhů + /admin/texty/

**Status:** TODO
**Date:** 2026-04-23
**Sprint:** 003-admin

## Kontext

Run 012 dodal funkční raw markdown editor, ale user musí psát YAML ručně. Tenhle run postaví:

1. **Strukturovaný form** pro frontmatter — inputy per pole, array manipulátory (add/remove řádků pro `distribution`, `diet`, `gallery`, `sources`). Body zůstává textarea (TipTap v Run 014).
2. **`/admin/texty/`** — flat key-value pro hardcoded stringy v homepage/o-projektu. Vyžaduje refaktor `src/config/site.ts` do samostatného JSON souboru, který admin edituje.

## Zadání

- [ ] `src/lib/admin/frontmatter.ts` — parser + serializer YAML frontmatteru (minimal, pokrývá jen patterny ze schema: scalars, arrays, nested objects, tuples). ~180 řádků.
- [ ] `src/components/admin/SpeciesForm.astro` — form komponenta, dělí se na sekce (identita, velikost, distribuce, strava, ...). Každá sekce má vlastní inputy.
- [ ] `src/pages/admin/druhy/[slug].astro` — switchne raw editor na structured form; zachovat raw jako fallback pokud parser selže.
- [ ] Refaktor `src/config/site.ts` → `src/content/site.json` + helper pro čtení.
- [ ] `src/pages/admin/texty/index.astro` — list editovatelných stringů (homepage hero, o-projektu sekce, navigace, kvíz) + editor.
- [ ] `src/pages/api/admin/texty/[key].ts` — GET/PUT pro site stringy.

## Risks

- Strukturovaný form pro array objektů (gallery, sources) je nejtěžší část — browser add/remove rows, validace, preserve order. Zvážit, zda to nerozdělit na Run 013a (strukturovaný frontmatter jen pro scalars) a Run 013b (array objektů).
- Změna `site.ts` → `site.json` změní import patterny napříč stránkami (6-10 souborů). Zvážit opatrně.

## Soubory ke čtení

- `src/content.config.ts` — schema
- `src/content/species/cisarsky.md` — vzor pro parser test
- `src/pages/admin/druhy/[slug].astro` — kam integrovat form
- `src/config/site.ts` — co refaktorovat

## Plán souborů

- `src/lib/admin/frontmatter.ts` ~180 ř
- `src/components/admin/SpeciesForm.astro` ~180 ř (hraniční, zvažovat split)
- `src/pages/admin/druhy/[slug].astro` update ~50 ř dodatku
- `src/content/site.json` ~30 ř
- `src/lib/site.ts` ~20 ř helper
- `src/pages/admin/texty/index.astro` ~120 ř
- `src/pages/api/admin/texty/[key].ts` ~80 ř
