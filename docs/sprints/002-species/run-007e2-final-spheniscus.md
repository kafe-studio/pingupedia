# Run 007e2: Galerie posledních 2 Spheniscus — dokončení Sprintu 002

**Status:** in-progress
**Date:** 2026-04-20
**Sprint:** 002-species
**Dashboard Run:** 26

<!-- dashboard-tasks: {"Galerie Spheniscus magellanicus (magellansky) — 2-3 fotky + frontmatter + CREDITS": 111, "Galerie Spheniscus mendiculus (galapazsky) — 2-3 fotky + frontmatter + CREDITS": 112, "Build verify + review + commit + deploy": 113} -->

## Kontext

**Poslední run Sprintu 002.** Po 007a-e1 je hotových 15/17 druhů s galerií. Zbývají dvě Spheniscus: **magellansky** (jihoamerický, Patagonie) a **galapazsky** (jediný tropický druh tučňáka, endemit Galapág).

Po dokončení: **17/17 druhů s galerií = Sprint 002 kompletní**. Další přirozený krok je `/audit` celého sprintu před Sprint 003 (mapy/infografiky).

## Zadání

- [ ] Galerie Spheniscus magellanicus (magellansky) — 2-3 fotky + frontmatter + CREDITS
- [ ] Galerie Spheniscus mendiculus (galapazsky) — 2-3 fotky + frontmatter + CREDITS
- [ ] Build verify + review + commit + deploy (ukončení sprintu zaslouží deploy)

## Pravidla

- Licence: CC-BY / CC-BY-SA / PD, plná atribuce
- `img-nocrop` + `object-contain` přes `<SpeciesGallery>`
- Konvence `src/assets/penguins/<slug>/gallery-N.jpg`
- CREDITS plná atribuce
- Absolutní cesty v curl
- Preferovat **wild habitat** fotky (ne zoo)

## Soubory ke čtení

- `src/content/species/{magellansky,galapazsky}.md`
- `src/assets/penguins/CREDITS.md`
