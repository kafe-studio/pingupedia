# Run 007e1: Galerie — Megadyptes + Eudyptula + 2× Spheniscus

**Status:** in-progress
**Date:** 2026-04-20
**Sprint:** 002-species
**Dashboard Run:** 25

<!-- dashboard-tasks: {"Galerie Megadyptes antipodes (zlutooky) — 2-3 fotky + frontmatter + CREDITS": 106, "Galerie Eudyptula minor (nejmensi) — 2-3 fotky + frontmatter + CREDITS": 107, "Galerie Spheniscus demersus (brylovy) — 2-3 fotky + frontmatter + CREDITS": 108, "Galerie Spheniscus humboldti (humboldtuv) — 2-3 fotky + frontmatter + CREDITS": 109, "Build verify + review + commit": 110} -->

## Kontext

Run 007d dokončil celý rod Eudyptes (6/6 druhů s galerií). 007e1 pokrývá 4 druhy z různých rodů:
- **Megadyptes antipodes** (zlutooky) — endemit Nového Zélandu, jeden z nejohroženějších
- **Eudyptula minor** (nejmensi) — nejmenší druh, Nový Zéland + Austrálie
- **Spheniscus demersus** (brylovy) — jihoafrický, ohrožený
- **Spheniscus humboldti** (humboldtuv) — Peru + Chile, ohrožený

Po tomto runu **15/17** druhů s galerií. Run 007e2 (brylovy a humboldtuv) zbývá.

## Zadání

- [ ] Galerie Megadyptes antipodes (zlutooky) — 2-3 fotky + frontmatter + CREDITS
- [ ] Galerie Eudyptula minor (nejmensi) — 2-3 fotky + frontmatter + CREDITS
- [ ] Galerie Spheniscus demersus (brylovy) — 2-3 fotky + frontmatter + CREDITS
- [ ] Galerie Spheniscus humboldti (humboldtuv) — 2-3 fotky + frontmatter + CREDITS
- [ ] Build verify (pnpm check + build) + review + commit

## Pravidla (beze změny)

- Licence: CC-BY / CC-BY-SA / PD, plná atribuce
- `img-nocrop` + `object-contain` přes `<SpeciesGallery>`
- Konvence `src/assets/penguins/<slug>/gallery-N.jpg`
- CREDITS formát: autor, licence, zdroj, originál, místo, datum
- Absolutní cesty v curl/bash
