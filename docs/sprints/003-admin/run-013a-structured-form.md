# Run 013a: Strukturovaný form druhů (scalars + simple collections)

**Status:** IN-PROGRESS
**Date:** 2026-04-24
**Sprint:** 003-admin
**Dashboard Run:** 29

<!-- dashboard-tasks: {"yaml lib + frontmatter.ts wrapper (bp)": 128, "species-form-client.ts (bp)": 129, "SpeciesForm.astro structured form (bp)": 130, "druhy/[slug].astro integrate form + raw fallback": 131, "Astro check + build + commit + deploy": 132} -->

## Kontext

Run 012 dodal raw markdown editor (MVP). Tento run ho doplní o **strukturovaný form** pro běžná pole (name, genus, IUCN, description, habitat, population, historicalNotes, size tuples, distribution/diet seznamy, lifespan, hero object, body text).

Array objektů `gallery` a `sources` zůstávají fallback jako raw JSON (user zvládne přes raw markdown toggle). Plný form s add/remove row UI pro ně přijde v Run 013c. Refaktor `site.ts` + `/admin/texty/` je Run 013b.

## Zadání

- [ ] `pnpm add yaml` + `src/lib/admin/frontmatter.ts` — thin wrapper (split `---` frontmatter/body, parse, stringify přes `yaml` lib)
- [ ] `src/lib/admin/species-form-client.ts` — form serializer: DOM → partial object → merge do parsed frontmatter → stringify → PUT (zachovává ne-formová pole beze změny)
- [ ] `src/components/admin/SpeciesForm.astro` — form sekce: identita, velikost (tuple), distribuce, strava, životnost, populace, historie, hero fieldset, body textarea. IUCN jako select.
- [ ] `src/pages/admin/druhy/[slug].astro` — primárně strukturovaný form; raw markdown v `<details>` jako fallback pro pokročilé
- [ ] Astro check + build + commit + deploy

## Design

### Merge strategie

Parser načte celý frontmatter → object. Form vyrenderuje jen scalar pole, array objektů necháme beze změny. Při submit:

1. Vezmu původní parsed object
2. Přepíšu scalar pole novými hodnotami z formu
3. Pro arrays distribution/diet = nový pole z řádků textarea
4. Pro size.heightCm/weightKg = tuple z dvou number inputů
5. Pro hero = nový object z 5 inputů
6. `updatedAt` = dnešek (ISO date)
7. Zbytek (gallery, sources, audio, video) zůstane netčený — YAML lib zachová pořadí a formátování

### Fallback (raw mode)

Pokud parser selže nebo user chce edit complex pole → rozkliknout `<details>` → raw textarea s celým souborem. Raw mode má samostatný submit button (explicit) se stejnou PUT API.

## Řešení

(doplní se během runu)

## Poznámky

(doplní se během runu)
