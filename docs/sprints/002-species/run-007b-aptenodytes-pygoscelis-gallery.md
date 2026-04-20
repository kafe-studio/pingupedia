# Run 007b: Galerie — Aptenodytes patagonský + rod Pygoscelis

**Status:** in-progress
**Date:** 2026-04-20
**Sprint:** 002-species
**Dashboard Run:** 22

<!-- dashboard-tasks: {"Galerie Aptenodytes patagonský (2-3 fotky z Commons) + frontmatter + CREDITS": 93, "Galerie Pygoscelis kroužkový (2-3 fotky z Commons) + frontmatter + CREDITS": 94, "Galerie Pygoscelis oslí (2-3 fotky z Commons) + frontmatter + CREDITS": 95, "Galerie Pygoscelis uzdičkový (2-3 fotky z Commons) + frontmatter + CREDITS": 96, "Build verify + review + commit": 97} -->

## Kontext

Run 007a postavil lightbox infrastrukturu (`SpeciesGallery.astro` + `lib/lightbox.ts` + `styles/lightbox.css`) a pilotně ji nasadil na druh `cisarsky` (3 fotky). Run 007b je první content batch — postupný seed galerií pro zbývajících 16 druhů (4-5/run).

Výběr batche: dokončit **Aptenodytes** (patagonský) + celý rod **Pygoscelis** (kroužkový, oslí, uzdičkový). Po tomto runu bude hotových 5/17 druhů s galerií (cisarsky + patagonsky + 3× Pygoscelis). Zbývá 12 druhů na runy 007c/d/e.

## Zadání

- [ ] Galerie Aptenodytes patagonský (2-3 fotky z Wikimedia Commons) + frontmatter + CREDITS
- [ ] Galerie Pygoscelis kroužkový (2-3 fotky z Wikimedia Commons) + frontmatter + CREDITS
- [ ] Galerie Pygoscelis oslí (2-3 fotky z Wikimedia Commons) + frontmatter + CREDITS
- [ ] Galerie Pygoscelis uzdičkový (2-3 fotky z Wikimedia Commons) + frontmatter + CREDITS
- [ ] Build verify (pnpm check + build) + review + commit

## Pravidla (shodná s Run 007a)

- **Licence:** pouze CC-BY, CC-BY-SA, nebo public domain. Atribuce plně vyplněná.
- **No-crop invariant** — fotky se zobrazí přes `<SpeciesGallery>`, tedy `img-nocrop` utility + lightbox `object-fit: contain`.
- **Konvence adresářů** — `src/assets/penguins/<slug>/gallery-N.jpg` (1-based).
- **CREDITS záznam** — autor, licence, zdrojový Commons URL, originál URL, místo, datum pořízení, datum stažení, účel.
- **Volba fotek** — různorodost (kolonie, detail, chování, mládě) a kvalita (min. ~1500px kratší strana).
- **Frontmatter** — `gallery:` pole objektů se stejnou strukturou jako `hero` (src, alt, author, license, sourceUrl).

## Soubory ke čtení

- `src/content/species/{patagonsky,krouzkovy,osli,uzdickovy}.md` — stávající frontmatter pro doplnění gallery pole
- `src/assets/penguins/CREDITS.md` — formát záznamu k dodržení
- `src/content/species/cisarsky.md` — reference pro gallery frontmatter
