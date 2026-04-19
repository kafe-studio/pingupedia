# Run 003: Species content collection schema + 1 testovací druh

**Status:** IN_PROGRESS
**Date:** 2026-04-19
**Sprint:** 001-foundation
**Dashboard Run:** 13

<!-- dashboard-tasks: {"Species schema v content.config.ts (mcp)": 55, "Presun fotky do per-druh adresare + update CREDITS": 56, "Naseedovany druh cisarsky.md s 3+ zdroji": 57, "PROJECT.md sekce Datovy model druhu": 58, "Typecheck + build verify": 59} -->

## Kontext

Sprint 001 má za sebou cleanup (Run 001) a vizuální identitu + obrázková pravidla (Run 002). Teď potřebujeme **datový model pro druhy tučňáků** — Astro content collection se schématem, které zachytí všechno, co encyklopedický záznam druhu potřebuje: taxonomii, český + latinský název, IUCN status, distribuci, velikost/váhu, potravu, život, historické souvislosti, fotky s licencí a — povinně — seznam ověřených zdrojů.

Po tomto runu má projekt: `src/content/species/` kolekci se zod schématem, jeden kompletně naseedovaný testovací druh (tučňák císařský, navazuje na fotku z Run 002) a potvrzení, že schema validuje přes `pnpm build`.

Samotné veřejné stránky `/druhy/` a `/druhy/[slug]` přijdou až ve Sprint 002 (Run 004, 005). Tento run je čistě datový základ.

## Zadání

- [ ] Vytvořit `src/content.config.ts` se species collection (mcp — Astro 6: content collections, `loader` API, `glob` pattern). Schema: `slug` (derived), `nameCs`, `nameLat`, `nameEn?`, `genus`, `iucnStatus` (enum: LC/NT/VU/EN/CR/DD/EX), `description` (shortChar[] ≤ 240), `size` ({ heightCm: [min, max], weightKg: [min, max] }), `distribution` (string[]), `habitat`, `diet` (string[]), `lifespan` ({ wildYears, captivityYears? }), `population?`, `historicalNotes?`, `hero` ({ src: image, alt, author, license, sourceUrl }), `gallery?` (podobné hero, pole), `sources` (required, minimum 2, { url, title, type: enum Wikipedia/IUCN/BirdLife/Science/Museum/Other, note? }), `updatedAt` (date).
- [ ] Pro `hero.src` + `gallery[].src` použít Astro `image()` helper ze `schema.image()` kontextu, aby schema validoval ImageMetadata (mcp — Astro 6: image() helper v content collections).
- [ ] Vytvořit první testovací druh — `src/content/species/cisarsky.md` — tučňák císařský, data z Wikipedia + IUCN, reference na již staženou fotku z Run 002 (emperor-penguin-snow-hill.jpg jako hero). Minimálně 3 sources (Wikipedia CS, IUCN Red List, BirdLife), dva paragrafy populárně-naučného textu v body.
- [ ] Přesunout fotku tučňáka do species-specific adresáře nebo nastavit konvenci: buď `src/assets/penguins/<slug>/` (per-druh adresář) nebo ponechat flat strukturu. Rozhodnout a dokumentovat v `docs/PROJECT.md`.
- [ ] Aktualizovat `src/assets/penguins/CREDITS.md` — pokud se fotka přesune, zapsat novou cestu. Pokud zůstane, doplnit poznámku o přiřazení k druhu.
- [ ] Aktualizovat `docs/PROJECT.md` — sekce „Datový model druhů" s popisem schémátu, konvencí pro fotky a povinných polí (hlavně `sources`).
- [ ] Ověřit: `pnpm typecheck` + `pnpm build` projdou. Astro `astro check` musí validovat kolekci bez errors.

## Soubory ke čtení

- `node_modules/astro/dist/content/` — verify Astro 6 content collection API (glob loader, image() helper)
- `src/assets/penguins/emperor-penguin-snow-hill.jpg` — existující hero foto
- `src/assets/penguins/CREDITS.md` — existující licence záznam
- `docs/PROJECT.md` — kam dodat sekci „Datový model druhů"
- `astro.config.mjs` — neměnit, jen pro kontext image service
- Vědecké zdroje — Wikipedia (cs+en) pro Aptenodytes forsteri, IUCN Red List entry, BirdLife species page (pro testovací druh)

## Kritéria hotového

- `src/content.config.ts` obsahuje `species` kolekci s kompletním zod schématem (hero, sources, taxonomie)
- `src/content/species/cisarsky.md` existuje a validuje — všechna povinná pole vyplněná, 2+ ověřené zdroje
- `sources` je enforced (minimum 2) — validator selže bez dostatečných zdrojů (test: odeberte jeden zdroj, build musí selhat)
- Fotka tučňáka z Run 002 je referenced jako `hero.src` a prochází Image optimization
- `pnpm build` projde bez chyb, `astro check` bez warnings
- `docs/PROJECT.md` popisuje datový model a konvenci pro fotky

## Mimo rozsah

- Stránky `/druhy/` a `/druhy/[slug]` — přijdou ve Sprint 002 (Run 004/005)
- Ostatních 17 druhů — Sprint 002 Run 006 (seed)
- Mapa distribuce, časová osa — Sprint 003
