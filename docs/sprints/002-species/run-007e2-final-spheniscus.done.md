# Run 007e2: Galerie posledních 2 Spheniscus — dokončení Sprintu 002

**Status:** DONE
**Date:** 2026-04-20
**Sprint:** 002-species
**Dashboard Run:** 26
**Session:** Sprint 002 Run 007e2 — finále, Sprint 002 kompletní 17/17

<!-- dashboard-tasks: {"Galerie Spheniscus magellanicus (magellansky) — 2-3 fotky + frontmatter + CREDITS": 111, "Galerie Spheniscus mendiculus (galapazsky) — 2-3 fotky + frontmatter + CREDITS": 112, "Build verify + review + commit + deploy": 113} -->

## Kontext

**Poslední run Sprintu 002.** Po 007a-e1 je hotových 15/17 druhů s galerií. Zbývají dvě Spheniscus: **magellansky** (jihoamerický, Patagonie) a **galapazsky** (jediný tropický druh tučňáka, endemit Galapág).

Po dokončení: **17/17 druhů s galerií = Sprint 002 kompletní**. Další přirozený krok je `/audit` celého sprintu před Sprint 003 (mapy/infografiky).

## Zadání

- [x] Galerie Spheniscus magellanicus (magellansky) — 3 fotky + frontmatter + CREDITS
- [x] Galerie Spheniscus mendiculus (galapazsky) — 3 fotky + frontmatter + CREDITS
- [x] Build verify + review + commit + deploy (ukončení sprintu zaslouží deploy)

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

## Řešení (co a jak bylo uděláno)

- **magellansky** — Puñihuil, Chiloé 2025 Quality image (Charles J. Sharp, CC BY-SA 4.0), Saunders Island Falklandy 2017 (Andrew Shiva, CC BY-SA 4.0), objímající pár — Wiki Science Competition 2025 winner (Stch2022, CC BY 4.0). Pokryje tři hlavní areály + sociální chování.
- **galapazsky** — Punta Espinosa Fernandina 2005 (James Preston, CC BY 2.0), plavání Isabela 2013 (Andrew Skujins, CC BY-SA 3.0), recentní Galapágy 2025 (Enoch Leung, CC BY-SA 4.0). Pokryje lávové skály, plavání, close-up.
- **Build verify** — `pnpm check` 0/0/0, `pnpm build` Complete.

## Poznámky

- **Sprint 002 kompletní: 17/17 druhů s galerií.** Všechny rody tučňáků (6) mají hotový seed (hero + 2-3 gallery fotky).
- **Commons Featured/Quality coverage vynikající pro magellansky** (Charles J. Sharp recentní QI), solidní pro galapazsky (populární turistické místo).
- **Recent Galapágy 2025 (Enoch Leung)** — fotka je z září 2025 = nedávná, nejlepší kvalita v Commons pro tento druh, s vysokým rozlišením.
- **Wiki Science Competition 2025 winner** u magellansky gallery-3 — Stch2022's photo získal ocenění v kategorii wildlife/nature (USA).
- **Další přirozený krok:** `/audit` celého Sprintu 002 — kontrola faktické přesnosti 17 druhů, validace IUCN URLs, overall polish. Poté otevřít Sprint 003 (mapy + historie + infografiky).
- **Licenční mix Sprintu 002 (všechny 17 druhů × ~3 gallery fotky):** převažují CC BY-SA 4.0 / 3.0 / 2.0 (~70 %), CC BY 4.0 / 2.0 (~20 %), public domain (~10 %). Všechny atribuce plně vyplněné v CREDITS.md.
- **Statistika Sprintu 002:** 7 runů galerie (007a až 007e2), **17 druhů**, **~50 gallery fotek** + 17 hero fotek = **~67 fotografií** z Wikimedia Commons se správně vyplněnými licenčními údaji.
