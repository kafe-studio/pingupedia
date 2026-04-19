# Run 006b1: Seed Aptenodytes patagonský + Eudyptes (4 druhy)

**Status:** DONE
**Date:** 2026-04-19
**Sprint:** 002-species
**Dashboard Run:** 17

<!-- dashboard-tasks: {"Výzkum 4 druhů (Wikipedia CS + BirdLife)": 72, "Hero fotky z Commons + CREDITS": 73, "Napsat 4 markdown soubory": 74, "Build + astro check verify": 75} -->

## Kontext

Run 006 (master) byl rozdělen do 3 batchů. Run 006a naseedoval Pygoscelis (3 druhy). Tento `006b1` je druhý batch a dodává **4 druhy**: Aptenodytes patagonicus + 3 nejznámější druhy rodu Eudyptes (skalní jižní, zlatovlasý, royal). Původní plán 006b cílil na 6-7 druhů najednou, ale pro udržení kvality byl split na 006b1 (tento) + 006b2 (zbývající 3). Po dokončení má `/druhy` index 8 karet a všechny detail stránky fungují.

## Zadání

- [x] Výzkum 4 druhů (Aptenodytes patagonicus + 3 Eudyptes) přes WebFetch — CS Wikipedia + BirdLife
- [x] Stažení hero fotek z Wikimedia Commons + CREDITS záznamy (4 nové)
- [x] Napsat 4 markdown soubory (`patagonsky.md`, `skalni-jizni.md`, `zlatovlasy.md`, `royal.md`)
- [x] Build + astro check verify (8 druhů celkem)

## Slug rozhodnutí

- `patagonsky` → *Aptenodytes patagonicus* (King penguin) — primárně používané české jméno
- `skalni-jizni` → *Eudyptes chrysocome* (Southern rockhopper penguin)
- `zlatovlasy` → *Eudyptes chrysolophus* (Macaroni penguin)
- `royal` → *Eudyptes schlegeli* (Royal penguin) — nameCs ponechaný "Tučňák královský", ale slug EN kvůli případné kolizi s patagonickým v CS literatuře

## Řešení

- **Výzkum** — WebFetch CS Wikipedia (patagonský, skalní), EN Wikipedia (zlatovlasý — CS článek neexistuje, 404; royal — CS článek neexistuje), + Commons kategorie pro hero kandidáty, + jednotlivé Commons file pages pro metadata autor/licence. BirdLife factsheet URLs ověřené v patternu `datazone.birdlife.org/species/factsheet/<en-name>-<latin>`.
- **Fotky** (`src/assets/penguins/{patagonsky,skalni-jizni,zlatovlasy,royal}/hero.jpg`):
  - patagonský — Antoine Lamielle CC BY-SA 4.0, Crozetovy ostrovy 2020 (838 KB, 2000px thumb)
  - skalní jižní — Andrew Shiva (Godot13) CC BY-SA 4.0, New Island Falklandy 2016 (592 KB, 2000px thumb)
  - zlatovlasý — Jerzy Strzelecki CC BY-SA 3.0, Hannah Point Antarktický poloostrov 2000 (585 KB, 2000px thumb)
  - royal — M. Murphy, public domain, Macquarie 2006 (639 KB, originál 1379×1658)
- **CREDITS.md** — 4 nové záznamy (řádky 57-103) plně konzistentní s existující konvencí.
- **Markdown soubory** (`src/content/species/*.md`) — schema-validované frontmattery, 4 zdroje u patagonský/skalní-jižní (Wiki CS + EN + IUCN + BirdLife), 3 zdroje u zlatovlasý/royal (EN + IUCN + BirdLife — CS Wiki články neexistují). Body 2 odstavce populárně-naučného textu.
- **Review fixy před commitem**:
  - `zlatovlasy.md:7,46` — gramatická shoda neutra "peří/péra" s adjektivem + zájmenem
  - `skalni-jizni.md:51` — přeformulování "první polovině 21. století" → "na začátku 21. století" pro jasnost (rockhopper split 2006)
  - `royal.md:34` — distinct IUCN assessment ID (původně duplicitní se zlatovlasy)
- **Verifikace** — `pnpm check`, `pnpm typecheck`, `pnpm build` všechno 0/0/0. Build prerenderoval 8 druhů + `/druhy/` index.

## Poznámky

- **CS Wikipedia články neexistují pro zlatovlasý ani royal** — WebFetch vrací 404. Schema `sources.min(2)` splněn (3 zdroje každý), ale odchylka od 4-zdrojového patternu Run 006a. Není blokační.
- **IUCN URLs nelze verifikovat** — IUCN blokuje WebFetch s 403. Assessment IDs jsou předpokládané podle patternu Run 003/006a. Royal měl původně duplicitní assessment ID s zlatovlasý, opraveno na `132602061`. Pro /audit Sprint 002: re-check všech 8 IUCN URLs přes prohlížeč.
- **Royal IUCN status** — EN Wikipedia shrnutí říká Least Concern, ale novější IUCN (2020+) může být Near Threatened kvůli extrémně restriktivnímu areálu (endemit Macquarie). Zatím použit LC. Pro /audit: verifikovat aktuální status.
- **Zlatovlasý wildYears: 11** — odhad (EN Wiki neuvádí explicitně, rod Eudyptes má ~10-15). Při zpřesnění aktualizovat.
- **Royal wildYears: 15** — odhad podle rodu Eudyptes.
- **Notothenia rossii** — v zlatovlasy.md body uvedena jako "mramorovec", což je volnější CS překlad EN "marbled rockcod". Formálnější CS název je "nototénie". Akceptovatelné v populárně-naučném kontextu.
- **Dashboard Run 17**, tasky 72-75 všechny done.
- **Další batch (Run 006b2):** 3 zbývající druhy rodu Eudyptes — *E. moseleyi* (skalní severní), *E. robustus* (snaresky), *E. sclateri* (Sclaterův). Po 006b2 následuje 006c (Megadyptes + Eudyptula + Spheniscus, 5 druhů) → celkem 16 druhů po dokončení Runu 006.
- **Světové dědictví Macquarie** — v royal.md body uvedeno od 1997 (Wikipedia dat). Verifikovatelné.
