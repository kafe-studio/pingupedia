# Run 006b2: Seed zbývající Eudyptes (3 druhy)

**Status:** TODO
**Date:** 2026-04-19
**Sprint:** 002-species

## Kontext

Pokračování po Run 006b1. Po dokončení je kompletně pokryt rod **Eudyptes** (všech 6 druhů) a rod **Aptenodytes** (oba druhy). Tento batch dodá 3 poslední Eudyptes:

1. **Eudyptes moseleyi** — skalní severní (Northern rockhopper penguin), od 2006 oddělený od *E. chrysocome*. IUCN: Endangered
2. **Eudyptes robustus** — snaresky / Snaresův (Snares penguin), endemit Snares Islands. IUCN: Vulnerable
3. **Eudyptes sclateri** — Sclaterův (Erect-crested penguin), hnízdí na Bounty a Antipodes islands. IUCN: Endangered

Po 006b2 následuje 006c (Megadyptes + Eudyptula + Spheniscus, 5 druhů). Po dokončení má `/druhy` index 11 karet.

## Zadání

- [ ] Výzkum 3 druhů Eudyptes přes WebFetch — EN Wikipedia (CS články pravděpodobně neexistují) + BirdLife factsheet
- [ ] Stažení 3 hero fotek z Wikimedia Commons + CREDITS záznamy
- [ ] Napsat 3 markdown soubory (`skalni-severni.md`, `snaresky.md`, `sclateruv.md`)
- [ ] Build + astro check verify (11 druhů celkem)

## Slug rozhodnutí

- Tučňák skalní severní → `skalni-severni`
- Tučňák snaresky (Snaresův) → `snaresky`
- Tučňák Sclaterův → `sclateruv`

## Soubory ke čtení

- `src/content/species/skalni-jizni.md` — vzor (sister species, stejný pattern frontmatteru pro rockhoppera)
- `src/content/species/zlatovlasy.md` — vzor pro Eudyptes bez CS Wiki zdroje
- `src/assets/penguins/CREDITS.md` — konvence licenčních záznamů
- `docs/sprints/002-species/run-006b1-aptenodytes-eudyptes1.done.md` — lessons (gramatická shoda neutra, assessment IDs distinct)

## Poznámky

- **IUCN status:** moseleyi EN, robustus VU, sclateri EN — 2 druhy jsou Endangered, což přidá barevnou variabilitu do `/druhy` indexu
- **CS Wikipedia** pravděpodobně neexistují články pro tyto 3 druhy → 3 zdroje (EN Wiki + IUCN + BirdLife), stejně jako u zlatovlasý/royal
- **Assessment IDs IUCN** — použít distinct hodnoty, nekopírovat od jiného druhu. Pattern z Run 006b1.
- **Fotky:** Wikimedia Commons — Category:Eudyptes_moseleyi, Category:Eudyptes_robustus, Category:Eudyptes_sclateri
- **Lifespan** — pro rod Eudyptes ~10-15 let ve volné přírodě (pokud není ve zdroji uvedeno jinak)
- **Gramatická shoda neutra** — při popisu chocholky/peří pozor na "péra" (plurál neutra) vs "peří" (singular collective)
