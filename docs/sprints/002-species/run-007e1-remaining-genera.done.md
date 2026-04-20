# Run 007e1: Galerie — Megadyptes + Eudyptula + 2× Spheniscus

**Status:** DONE
**Date:** 2026-04-20
**Sprint:** 002-species
**Dashboard Run:** 25
**Session:** Sprint 002 Run 007e1 — předposlední content batch

<!-- dashboard-tasks: {"Galerie Megadyptes antipodes (zlutooky) — 2-3 fotky + frontmatter + CREDITS": 106, "Galerie Eudyptula minor (nejmensi) — 2-3 fotky + frontmatter + CREDITS": 107, "Galerie Spheniscus demersus (brylovy) — 2-3 fotky + frontmatter + CREDITS": 108, "Galerie Spheniscus humboldti (humboldtuv) — 2-3 fotky + frontmatter + CREDITS": 109, "Build verify + review + commit": 110} -->

## Kontext

Run 007d dokončil celý rod Eudyptes (6/6 druhů s galerií). 007e1 pokrývá 4 druhy z různých rodů:
- **Megadyptes antipodes** (zlutooky) — endemit Nového Zélandu, jeden z nejohroženějších
- **Eudyptula minor** (nejmensi) — nejmenší druh, Nový Zéland + Austrálie
- **Spheniscus demersus** (brylovy) — jihoafrický, ohrožený
- **Spheniscus humboldti** (humboldtuv) — Peru + Chile, ohrožený

Po tomto runu **15/17** druhů s galerií. Run 007e2 (brylovy a humboldtuv) zbývá.

## Zadání

- [x] Galerie Megadyptes antipodes (zlutooky) — 3 fotky + frontmatter + CREDITS
- [x] Galerie Eudyptula minor (nejmensi) — 3 fotky + frontmatter + CREDITS
- [x] Galerie Spheniscus demersus (brylovy) — 3 fotky + frontmatter + CREDITS
- [x] Galerie Spheniscus humboldti (humboldtuv) — 3 fotky + frontmatter + CREDITS
- [x] Build verify (pnpm check + build) + review + commit

## Pravidla (beze změny)

- Licence: CC-BY / CC-BY-SA / PD, plná atribuce
- `img-nocrop` + `object-contain` přes `<SpeciesGallery>`
- Konvence `src/assets/penguins/<slug>/gallery-N.jpg`
- CREDITS formát: autor, licence, zdroj, originál, místo, datum
- Absolutní cesty v curl/bash

## Řešení (co a jak bylo uděláno)

- **zlutooky** — rodina na Otago Peninsula (Steve/Bangkok, CC BY-SA 2.0), skupina na pláži tamtéž (Bartux, CC BY-SA 3.0), jedinec v umělé hnízdní boudě Penguin Place (Pseudopanax, PD). Silný fokus na Otago — hlavní chráněná oblast druhu.
- **nejmensi** — rehabilitovaný pták míří k moři Oamaru (Avenue, CC BY-SA 3.0), adult na Bruny Island Tasmánie (JJ Harrison, CC BY-SA 3.0), pelichající v hnízdní boudě Taputeranga Island (Kimberley Collins, CC BY-SA 4.0). Pokryje oba hlavní areály (NZ + AU).
- **brylovy** — Boulders Beach Quality image (Diego Delso, CC BY-SA 4.0, 2018), pár při páření (Votpuske, CC BY 4.0, 2023), FWS portrét (Dr. P. Dee Boersma / US FWS, PD). CR druh, 20 tis. ptáků.
- **humboldtuv** — skupina na Islas Ballestas (Dennis Jarvis, CC BY-SA 2.0, 2007), kolonie u Punta Caldera Chile (Carlos Teixidor, CC BY-SA 4.0, 2022), dvojice na Ballestas (Lisa Weichel, CC BY 2.0). Pokryje hlavní hnízdní lokality Peru i Chile.
- **Build verify** — `pnpm check` 0/0/0, `pnpm build` Complete.

## Poznámky

- **Commons Featured/Quality coverage** pro tyto rody je dobrá, hlavně pro zlutooky (Otago Peninsula) a brylovy (Boulders Beach) — populární turistická místa. Naopak nejmensi je rozsáhlý ale rozptýlený, fotky z více autorů a lokalit.
- **Zoo/managed settings akceptovány u Penguin Place (zlutooky) a nest box settings u nejmensi** — jde o wild-populace v konzervačních rezervacích, ne kapacitní zoo. Pseudopanax (zlutooky gallery-3) a Kimberley Collins (nejmensi gallery-3) je popisují jako wild birds v chráněných hnízdních boudách.
- **brylovy gallery-1 3.3 MB** — Diego Delso Quality image scaler nerespektoval width=2000 (stejný pattern jako patagonsky/skalni-severni gallery-3). Build ale generuje webp varianty.
- **Stav Sprintu 002: 15/17 druhů s galerií.** Zbývá Run 007e2 (magellansky + galapazsky) — dokončí Sprint 002.
- **Po Run 007e2 bude Sprint 002 kompletní** — všech 17 druhů s hero + galerií. Doporučený další krok: `/audit` celého sprintu před Sprint 003 (mapy/infografiky).
