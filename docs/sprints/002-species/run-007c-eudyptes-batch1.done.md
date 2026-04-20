# Run 007c: Galerie — Eudyptes batch 1 (skalní jižní, zlatovlasý, royal)

**Status:** DONE
**Date:** 2026-04-20
**Sprint:** 002-species
**Dashboard Run:** 23
**Session:** Sprint 002 Run 007c — druhý content batch galerií

<!-- dashboard-tasks: {"Galerie Eudyptes chrysocome (skalní jižní) — 2-3 fotky + frontmatter + CREDITS": 98, "Galerie Eudyptes chrysolophus (zlatovlasý) — 2-3 fotky + frontmatter + CREDITS": 99, "Galerie Eudyptes schlegeli (royal) — 2-3 fotky + frontmatter + CREDITS": 100, "Build verify + review + commit": 101} -->

## Kontext

Run 007b dokončil galerie pro rod Pygoscelis (3 druhy) + patagonsky. Run 007c pokračuje s rodem **Eudyptes** — první polovinou (3 druhy ze 6). Druhá polovina Eudyptes přijde v Run 007d.

Stav po tomto runu bude 8/17 druhů s galerií.

## Zadání

- [x] Galerie Eudyptes chrysocome (skalní jižní) — 3 fotky + frontmatter + CREDITS
- [x] Galerie Eudyptes chrysolophus (zlatovlasý / macaroni) — 3 fotky + frontmatter + CREDITS
- [x] Galerie Eudyptes schlegeli (royal) — 3 fotky + frontmatter + CREDITS
- [x] Build verify (pnpm check + build) + review + commit

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

## Řešení (co a jak bylo uděláno)

- **skalni-jizni** — kolonie West Point Island (Liam Quinn, CC BY-SA 2.0), skok na skálu Saunders Island (Liam Quinn), detail hlavy 2024 New Island (Stefan Brending / 2eight, CC BY-SA 3.0 DE). Iconic rockhopper action (scéna #2) + variety locations.
- **zlatovlasy** — dospělec mezi trsy Poa flabellata, Cooper Bay (Liam Quinn, CC BY-SA 2.0), detail hlavy Half Moon Island 2025 (lwolfartist, CC BY 2.0), osamělý pták Murrell Farm Falklandy (Nick / IntrepidExplorer82, CC BY 2.0).
- **royal** — kolonie 60 000 ptáků Macquarie (Kimberley Collins, CC BY-SA 4.0), close-up bílé tváře (Lin Padgham, CC BY 2.0), skupina na oblázkové pláži (M. Murphy, PD — stejný autor jako hero RoyalPenguins2).
- **Build verify** — `pnpm check` 0/0/0, `pnpm build` OK (129 obrázků optimalizováno → webp varianty).
- **CREDITS.md** rozšířeno o 9 záznamů.

## Poznámky

- **Cwd bug fix z 007b se potvrdil** — všechny curl volání použily absolutní cestu `/home/github/pingupedia/src/assets/penguins/<slug>/gallery-N.jpg`, žádné nested dirs. Workflow pro 007d/e pokračuje stejně.
- **Malý close-up (royal gallery-2, 843×666)** — akceptované pro detail face shot, Astro pipeline generuje menší webp varianty. V gallery thumbnail (400-800px) nebude vidět rozdíl.
- **Commons Featured/Quality picture coverage rod Eudyptes je omezená** — Quality images pro chrysocome a chrysolophus nejsou vyčleněné jako dedikovaná podkategorie. Výběr podle popularity v Commons category + známých photographers (Liam Quinn, lwolfartist, Jerzy Strzelecki, Andrew Shiva). Licenční mix dobrý: 3× CC BY 2.0, 3× CC BY-SA 2.0, 1× CC BY-SA 3.0 DE, 1× CC BY-SA 4.0, 1× PD.
- **Stav Sprintu 002:** 8/17 druhů s galerií. Zbývá 9 druhů na runy 007d + 007e.
  - **007d** (3 Eudyptes): skalni-severni (moseleyi), snaresky (robustus), sclateruv (sclateri)
  - **007e** (3 rody / 6 druhů): zlutooky (Megadyptes), nejmensi (Eudyptula), a 4× Spheniscus (brylovy, humboldtuv, magellansky, galapazsky)
- **007e bude nejhustší run** — 6 druhů × 3 fotky = 18 fotek. Zvaž rozdělit na 007e1 + 007e2 podle pozůstalé rezervy kontextu.
