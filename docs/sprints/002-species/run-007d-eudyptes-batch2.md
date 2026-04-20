# Run 007d: Galerie — Eudyptes batch 2 (skalní severní, snareský, Sclaterův)

**Status:** in-progress
**Date:** 2026-04-20
**Sprint:** 002-species
**Dashboard Run:** 24

<!-- dashboard-tasks: {"Galerie Eudyptes moseleyi (skalní severní) — 2-3 fotky + frontmatter + CREDITS": 102, "Galerie Eudyptes robustus (snareský) — 2-3 fotky + frontmatter + CREDITS": 103, "Galerie Eudyptes sclateri (Sclaterův) — 2-3 fotky + frontmatter + CREDITS": 104, "Build verify + review + commit": 105} -->

## Kontext

Run 007c dokončil první polovinu rodu Eudyptes (chrysocome, chrysolophus, schlegeli). Run 007d dokončuje zbývající 3 druhy: **moseleyi** (severní rockhopper — vzácnější, jen Gough/Tristan), **robustus** (Snares — endemit novozélandských Snares Islands), **sclateri** (Sclaterův — endemit Antipody/Bounty Islands).

Stav po tomto runu bude **11/17** druhů s galerií, celý rod Eudyptes (6/6) hotov.

## Zadání

- [ ] Galerie Eudyptes moseleyi (skalní severní) — 2-3 fotky + frontmatter + CREDITS
- [ ] Galerie Eudyptes robustus (snareský) — 2-3 fotky + frontmatter + CREDITS
- [ ] Galerie Eudyptes sclateri (Sclaterův) — 2-3 fotky + frontmatter + CREDITS
- [ ] Build verify (pnpm check + build) + review + commit

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
