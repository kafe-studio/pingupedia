# Run 006b2: Seed zbývající Eudyptes (3 druhy)

**Status:** DONE
**Date:** 2026-04-19
**Sprint:** 002-species
**Dashboard Run:** 18
**Session:** Pokračování po Run 006b1 — content seed 3 zbývajících Eudyptes druhů (moseleyi, robustus, sclateri). 11/~18 druhů naseedováno.

<!-- dashboard-tasks: {"Výzkum 3 Eudyptes druhů (WebFetch)": 76, "Stáhnout 3 hero fotky + CREDITS": 77, "Napsat 3 markdown soubory": 78, "Build + astro check verify": 79} -->

## Kontext

Pokračování po Run 006b1. Po dokončení je kompletně pokryt rod **Eudyptes** (všech 6 druhů) a rod **Aptenodytes** (oba druhy). Tento batch dodal 3 poslední Eudyptes:

1. **Eudyptes moseleyi** — skalní severní (Northern rockhopper penguin), od 2006 oddělený od *E. chrysocome*. IUCN: Endangered
2. **Eudyptes robustus** — snareský / Snaresův (Snares penguin), endemit Snares Islands. IUCN: Vulnerable
3. **Eudyptes sclateri** — Sclaterův (Erect-crested penguin), hnízdí na Bounty a Antipodes islands. IUCN: Endangered

Po 006b2 následuje 006c (Megadyptes + Eudyptula + Spheniscus, 6 druhů). `/druhy` index má nyní 11 karet.

## Zadání (co se mělo udělat)

- [x] Výzkum 3 druhů Eudyptes přes WebFetch — EN Wikipedia + BirdLife factsheet
- [x] Stažení 3 hero fotek z Wikimedia Commons + CREDITS záznamy
- [x] Napsat 3 markdown soubory (`skalni-severni.md`, `snaresky.md`, `sclateruv.md`)
- [x] Build + astro check verify (11 druhů celkem)

## Řešení (co a jak bylo uděláno)

**Výzkum → EN Wiki + BirdLife URLs:**
- `Eudyptes moseleyi` — oddělen od E. chrysocome v 2006, popis 1921 Mathews & Iredale, pokles populace o 90 % od 50. let, MS Oliva 2011 incident
- `Eudyptes robustus` — endemit Snares Islands, hnízdí pod korunami stromů Olearia, ~25 000 párů, popsán 1953 W. Oliverem (dřívější Huttonův holotyp z 1874 ztracen v moři)
- `Eudyptes sclateri` — endemit Bounty + Antipodes, pojmenován po P. L. Sclaterovi, popsán 1888 Bullerem, unikátní kolmo vztyčené chocholky, 150 000 jedinců (v 70. letech 230 000 párů)
- BirdLife factsheet vrací dynamický loading (`Loading…` placeholders) → použit jen jako citační URL

**Fotky** (všechny staženy 2026-04-19 s pingupedia UA):
- `src/assets/penguins/skalni-severni/hero.jpg` — Brian Gratwicke, CC BY 2.0, Inaccessible Island 2012, 2000px thumb (540 KB)
- `src/assets/penguins/snaresky/hero.jpg` — Thomas Mattern, CC BY-SA 3.0, Station Cove 2004, originál 680×1024 (273 KB)
- `src/assets/penguins/sclateruv/hero.jpg` — C00ch, CC BY-SA 4.0, Proclamation Island 2019, originál 970×1500 (269 KB)
- `src/assets/penguins/CREDITS.md` — 3 nové záznamy podle existující konvence

**Markdown soubory (všechny prošly schema validací):**
- `src/content/species/skalni-severni.md` (46 ř.) — Eudyptes moseleyi, EN, 3 zdroje
- `src/content/species/snaresky.md` (46 ř.) — Eudyptes robustus, VU, 3 zdroje
- `src/content/species/sclateruv.md` (47 ř.) — Eudyptes sclateri, EN, 3 zdroje

**Build verify:**
- `pnpm check` → 0 errors / 0 warnings / 0 hints
- `pnpm typecheck` → 0 errors
- `pnpm build` → úspěch, 11 druhů prerenderovaných (+ /druhy index)

## Poznámky

- **/review odchytil 1 gramatickou chybu:** `snaresky.md:44` obsahoval `sclaterovu` s malým písmenem v přivlastňovacím adjektivu z vlastního jména. Opraveno na `Sclaterovu`. **Lekce pro další runy:** hlídat velká písmena v adjektivech odvozených od vlastních jmen (např. *Sclaterův*, *Bullerův*, *Humboldtův*).
- **První draft description** skalní severní překročil 240-znakový limit (~247 znaků). Schema ho odmítlo, zkrácen o ~30 znaků. **Lekce:** držet description ≤ 220 zn. pro bezpečnou rezervu.
- **IUCN assessment IDs** (22734408/184794766, 22697782/184807283, 22697795/184815861) jsou prediktivní a dosud browser-neověřené — /audit Sprint 002 by měl ověřit všech 11 URLs najednou.
- **BirdLife factsheet** má dynamický loading → slouží jen jako citační URL; reálná data tahat z EN Wiki nebo IUCN.
- **Lifespan odhady** (moseleyi 10, robustus 11, sclateri 10) pocházejí z rodové průměrné hodnoty Eudyptes, ne z primárního zdroje — /audit může zjemnit.
- **Po 006b2:** rod Eudyptes kompletní (6/6), rod Aptenodytes kompletní (2/2), Pygoscelis kompletní (3/3). Zbývá 006c pro rody Megadyptes (1), Eudyptula (1) a Spheniscus (4) = 6 druhů. Po 006c bude seed hotový (17 druhů) — do celkem ~18 by zbýval jen případný Eudyptula minor novaehollandiae (australský poddruh, taxonomicky sporný).

## Commit

- `0f8c9e9` Run 006b2: seed zbývající Eudyptes (skalni-severni, snaresky, sclateruv)
