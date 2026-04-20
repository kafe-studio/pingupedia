# Run 007c: Galerie — Eudyptes batch 1 (skalní jižní, zlatovlasý, royal)

**Status:** in-progress
**Date:** 2026-04-20
**Sprint:** 002-species
**Dashboard Run:** 23

<!-- dashboard-tasks: {"Galerie Eudyptes chrysocome (skalní jižní) — 2-3 fotky + frontmatter + CREDITS": 98, "Galerie Eudyptes chrysolophus (zlatovlasý) — 2-3 fotky + frontmatter + CREDITS": 99, "Galerie Eudyptes schlegeli (royal) — 2-3 fotky + frontmatter + CREDITS": 100, "Build verify + review + commit": 101} -->

## Kontext

Run 007b dokončil galerie pro rod Pygoscelis (3 druhy) + patagonsky. Run 007c pokračuje s rodem **Eudyptes** — první polovinou (3 druhy ze 6). Druhá polovina Eudyptes přijde v Run 007d.

Stav po tomto runu bude 8/17 druhů s galerií.

## Zadání

- [ ] Galerie Eudyptes chrysocome (skalní jižní) — 2-3 fotky + frontmatter + CREDITS
- [ ] Galerie Eudyptes chrysolophus (zlatovlasý / macaroni) — 2-3 fotky + frontmatter + CREDITS
- [ ] Galerie Eudyptes schlegeli (royal) — 2-3 fotky + frontmatter + CREDITS
- [ ] Build verify (pnpm check + build) + review + commit

## Pravidla (beze změny oproti 007a/b)

- Licence: CC-BY / CC-BY-SA / PD, plná atribuce
- `img-nocrop` + `object-contain` invariant dodržen přes `<SpeciesGallery>`
- Konvence `src/assets/penguins/<slug>/gallery-N.jpg`
- CREDITS: autor, licence, zdroj, originál, místo, datum
- Preference variety scén + Featured/Quality images z Commons
- **Pozor na cwd:** nepoužívat `cd` mezi bash voláními — vše absolutními cestami (poučení z 007b)

## Soubory ke čtení

- `src/content/species/{skalni-jizni,zlatovlasy,royal}.md` — stávající frontmatter pro doplnění gallery pole
- `src/assets/penguins/CREDITS.md` — formát záznamu
