# Run 007d: Galerie — Eudyptes batch 2 (skalní severní, snareský, Sclaterův)

**Status:** DONE
**Date:** 2026-04-20
**Sprint:** 002-species
**Dashboard Run:** 24
**Session:** Sprint 002 Run 007d — třetí content batch galerií, rod Eudyptes 6/6 hotov

<!-- dashboard-tasks: {"Galerie Eudyptes moseleyi (skalní severní) — 2-3 fotky + frontmatter + CREDITS": 102, "Galerie Eudyptes robustus (snareský) — 2-3 fotky + frontmatter + CREDITS": 103, "Galerie Eudyptes sclateri (Sclaterův) — 2-3 fotky + frontmatter + CREDITS": 104, "Build verify + review + commit": 105} -->

## Kontext

Run 007c dokončil první polovinu rodu Eudyptes (chrysocome, chrysolophus, schlegeli). Run 007d dokončuje zbývající 3 druhy: **moseleyi** (severní rockhopper — vzácnější, jen Gough/Tristan), **robustus** (Snares — endemit novozélandských Snares Islands), **sclateri** (Sclaterův — endemit Antipody/Bounty Islands).

Stav po tomto runu bude **11/17** druhů s galerií, celý rod Eudyptes (6/6) hotov.

## Zadání

- [x] Galerie Eudyptes moseleyi (skalní severní) — 3 fotky + frontmatter + CREDITS
- [x] Galerie Eudyptes robustus (snareský) — 3 fotky + frontmatter + CREDITS
- [x] Galerie Eudyptes sclateri (Sclaterův) — 3 fotky + frontmatter + CREDITS
- [x] Build verify (pnpm check + build) + review + commit

## Pravidla (beze změny)

- Licence: CC-BY / CC-BY-SA / PD, plná atribuce
- Invariant `img-nocrop` + `object-contain` přes `<SpeciesGallery>`
- Konvence `src/assets/penguins/<slug>/gallery-N.jpg`
- CREDITS: autor, licence, zdroj, originál, místo, datum
- **Absolutní cesty v curl/bash** — nepoužívat `cd` mezi voláními (poučení z 007b)

## Soubory ke čtení

- `src/content/species/{skalni-severni,snaresky,sclateruv}.md`
- `src/assets/penguins/CREDITS.md`

## Poznámka k dostupnosti fotek

- **moseleyi** (Gough, Tristan da Cunha, Inaccessible Island) — extrémně izolované, hrstka fotek na Commons, většina z turistických expedic
- **robustus** (Snares Islands) — přísně chráněná přírodní rezervace, fotky z výzkumných expedic (Otago University, Thomas Mattern)
- **sclateri** (Antipody, Bounty) — rovněž omezené, hrstka Featured/Quality images

## Řešení (co a jak bylo uděláno)

- **skalni-severni** — všechny 3 fotky z **Amsterdam Island** (TAAF, francouzská Indo-Antarktika) od Antoine Lamielle (CC BY-SA 4.0). Gallery-1 pod Entrecasteauxskými skalami (2020-12-03), gallery-2 horizontální pár na severním pobřeží (2021-09-29), gallery-3 portrét skupiny (2021-09-29, 11 MB — scaler ignoroval width param). Cat. Eudyptes_moseleyi na Commons explicitně postrádá chicks/swimming.
- **snaresky** — skupina (Lin Padgham, CC BY 2.0, 2007 Snares), potápění (Brocken Inaglory, CC BY-SA 3.0 dual-licensed), na skalách Southland 2023 (Christopher Stephens, CC BY-SA 4.0). Dobrá variety scén pro endemit Snares.
- **sclateruv** — hnízdní pár na Proclamation Island / Bounty (C00ch, CC BY-SA 4.0, 2019 — stejný autor jako hero), v subantarktických vodách (Christopher Stephens, CC BY-SA 4.0, 2021 iNaturalist import), kolonie Anchorage Bay / Antipodes (LawrieM, PD, 2009). Pokrývá hlavní hnízdní lokality i mořské chování.
- **Build verify** — `pnpm check` 0/0/0, `pnpm build` Complete (18 stránek + webp varianty).
- **CREDITS.md** rozšířeno o 9 záznamů, všechny s plnou atribucí.

## Poznámky

- **Rod Eudyptes: 6/6 druhů hotových** — největší rod tučňáků s galerií kompletně zpracovaný.
- **Antoine Lamielle jako dominantní fotograf moseleyi** — jediný systematický photographer Amsterdam Island kolonie v Commons. 3× stejný autor akceptován pro deficit jiných zdrojů (všechny lokality Gough/Tristan mají jen pár fotek od turistů).
- **11 MB JPG se opakuje** — patagonsky/gallery-3 (Run 007b), skalni-severni/gallery-3 (tento run). Portrait shots přes 3500×5000 obcházejí Special:FilePath `?width=2000`. Není blocker, build vytváří správné webp varianty. Pokud by to začalo být problém s velikostí repo, bude potřeba post-download resize (ImageMagick).
- **Stav Sprintu 002:** 11/17 druhů s galerií. Zbývá **6 druhů** na Run 007e:
  - Megadyptes: zlutooky
  - Eudyptula: nejmensi
  - Spheniscus: brylovy, humboldtuv, magellansky, galapazsky
- **Doporučuji split 007e → 007e1 + 007e2** — 6 druhů × 3 fotky = 18 fotek je nad komfortní rozsah jednoho runu. Např. 007e1 = Megadyptes + Eudyptula + 2 Spheniscus (brylovy, humboldtuv), 007e2 = zbývající 2 Spheniscus (magellansky, galapazsky). Alternativně první polovina Spheniscus podle geografické blízkosti.
