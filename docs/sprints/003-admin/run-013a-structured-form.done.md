# Run 013a: Strukturovaný form druhů (scalars + simple collections)

**Status:** DONE
**Date:** 2026-04-24
**Sprint:** 003-admin
**Dashboard Run:** 29

<!-- dashboard-tasks: {"yaml lib + frontmatter.ts wrapper (bp)": 128, "species-form-client.ts (bp)": 129, "SpeciesForm.astro structured form (bp)": 130, "druhy/[slug].astro integrate form + raw fallback": 131, "Astro check + build + commit + deploy": 132} -->

## Kontext

Run 012 dodal raw markdown editor (MVP). Tento run ho doplní o **strukturovaný form** pro běžná pole (name, genus, IUCN, description, habitat, population, historicalNotes, size tuples, distribution/diet seznamy, lifespan, hero object, body text).

Array objektů `gallery` a `sources` zůstávají fallback jako raw JSON (user zvládne přes raw markdown toggle). Plný form s add/remove row UI pro ně přijde v Run 013c. Refaktor `site.ts` + `/admin/texty/` je Run 013b.

## Zadání

- [x] `pnpm add yaml` + `src/lib/admin/frontmatter.ts` — thin wrapper přes `yaml` lib
- [x] `src/lib/admin/species-form-client.ts` — hydrate + collect + merge + PUT (zachovává gallery/sources/audio/video)
- [x] `src/components/admin/SpeciesForm.astro` — 6 sekcí (identita, rozměry, prostředí+strava, životnost+populace, hero, body+commit)
- [x] `src/pages/admin/druhy/[slug].astro` — přepnuto na `<SpeciesForm />`, raw v hidden textarea pro round-trip
- [x] Astro check + build + commit + deploy

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

- **`frontmatter.ts`** (59 ř) — `splitMarkdown` (regex na `---`), `parseMarkdown` (yaml.parse s object-shape check), `buildMarkdown` (yaml.stringify s `lineWidth: 0`, `defaultStringType: "QUOTE_DOUBLE"`). `FrontmatterParseError` pro error handling.
- **`species-form-client.ts`** (156 ř) — `mountSpeciesForm()`: registr submit, async load. `hydrateForm()` setne 25+ inputů (scalars + tuple páry `heightMin/Max`, `weightMin/Max` + arrays `distribution`/`diet` jako line-joined textarea + nested `hero` object + `lifespan`). `collectForm()` inverse — vezme parsed original, přepíše scalar/tuple/array/hero pole, **neDotkne se** `gallery/sources/audio/video` (zůstávají v `merged = { ...original }`). `buildMarkdown` zpět → PUT.
- **`SpeciesForm.astro`** (192 ř) — 6 `<section>` kartě. IUCN jako `<select>` 7 options. Tuple rozměry jako 4 number inputy. Arrays jako mono-font textarea (jeden item per řádek). Hero fieldset s 5 inputy. Body 16-row textarea. Commit message default prefix `Edit {slug}: `. Hidden `file-sha` + `raw` pro round-trip state.
- **`[slug].astro`** (41 ř) — wrapper: AdminLayout + breadcrumb + loading + error states + `<SpeciesForm />` + `<script>` mountSpeciesForm. Slug regex 400 na serveru.
- **Verify** — astro check 0/0/0 (72 files), build success. Prerenderuje 19 druhů + SSR admin.

## Poznámky

- **Scope revize:** Raw fallback `<details>` neimplementován — raw content je hidden textarea jen jako round-trip storage pro merge. Pokud parser selže, error směruje na git revert (species-form-client:150 upraven při /review).
- **Merge invariant** — yaml.stringify respektuje order + gallery/sources/audio/video netknuté (schema požaduje `sources.min(2)`, kdyby se ztratily, build by padnul).
- **Review WARNINGy (non-blocking):**
  - SpeciesForm:26 — form hidden na startu, JS-required pro mount (OK pro admin)
  - SpeciesForm — inputy bez `name` (funguje jen s JS, OK pro MVP)
  - [slug].astro:35 — žádný raw `<details>` fallback, hint směruje na git
- **Dashboard Run 29 closed**, tasks 128–132 všechny `done`.
