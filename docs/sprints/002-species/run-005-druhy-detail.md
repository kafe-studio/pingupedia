# Run 005: `/druhy/[slug]` detail

**Status:** TODO
**Date:** 2026-04-19
**Sprint:** 002-species

## Kontext

Run 004 postavil `/druhy` index s kartami druhů. Každá karta odkazuje na `/druhy/<slug>/`, ale detail zatím neexistuje — klik končí 404. Tento run dodá detail pro jeden druh (`cisarsky`) a připraví strukturu pro Run 006 (seed všech druhů). Datový model (`species` collection) obsahuje všechny pole — fakta, distribuce, dieta, lifespan, historické poznámky, zdroje, případnou galerii. Body markdown má populárně-naučný text.

## Zadání

- [ ] `src/pages/druhy/[slug].astro` — dynamic route, `getStaticPaths` z `getCollection("species")`, `prerender = true` (mcp)
- [ ] Hero sekce — velký `NoCropImage`, nameCs/nameLat, IUCN badge, krátký popis, atribuce fotky (autor + licence + odkaz)
- [ ] Fakta panel — size (výška/váha), rod, habitat, distribuce, dieta, lifespan (wild/captivity), population (pokud je)
- [ ] Markdown body render (`render(entry)`) — populárně-naučný text (mcp)(bp)
- [ ] Historické poznámky sekce (pokud `historicalNotes`)
- [ ] Zdroje — seznam s typem, titulkem, odkazem
- [ ] Galerie (pokud `gallery`) — zatím jen grid `NoCropImage` bez lightboxu (lightbox je Run 007)
- [ ] Typecheck + astro check + build verify

## Soubory ke čtení

- `src/content.config.ts` — aktuální species schema (všechny pole)
- `src/content/species/cisarsky.md` — struktura testovacího druhu (frontmatter + body)
- `src/components/species/SpeciesCard.astro` — IUCN badge styling pattern, labels/tone maps (k recyklaci do detailu)
- `src/components/media/NoCropImage.astro` — API pro hero v detailu
- `src/pages/druhy/index.astro` — konvence page struktury, metadata, reveal tříd
- `.astro/content.d.ts` — typy pro `getStaticPaths`/`render` (Astro 6 API, Context7 quota vyčerpaná do 1. 5.)

## Plán struktury

Detail stránka bude na hranici 200 řádků. Pokud roste přes limit, rozdělit:

- `src/components/species/SpeciesHero.astro` — hero sekce s atribucí
- `src/components/species/SpeciesFacts.astro` — fakta panel (size, rod, habitat, …)
- `src/components/species/SpeciesSources.astro` — seznam zdrojů s ikonkou podle typu
- `src/pages/druhy/[slug].astro` — orchestrace

IUCN badge je už v SpeciesCard. Buď extrahovat `IucnBadge.astro` (~30 řádků) s shared labels/tone, nebo prostě zkopírovat do SpeciesHero. Rozhodnutí na začátku runu — pokud je budeme potřebovat v Run 007 (galerie), extrahovat; jinak inline.
