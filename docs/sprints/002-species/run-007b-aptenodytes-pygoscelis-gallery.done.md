# Run 007b: Galerie — Aptenodytes patagonský + rod Pygoscelis

**Status:** DONE
**Date:** 2026-04-20
**Sprint:** 002-species
**Dashboard Run:** 22
**Session:** Sprint 002 Run 007b — první content batch po pilotu 007a

<!-- dashboard-tasks: {"Galerie Aptenodytes patagonský (2-3 fotky z Commons) + frontmatter + CREDITS": 93, "Galerie Pygoscelis kroužkový (2-3 fotky z Commons) + frontmatter + CREDITS": 94, "Galerie Pygoscelis oslí (2-3 fotky z Commons) + frontmatter + CREDITS": 95, "Galerie Pygoscelis uzdičkový (2-3 fotky z Commons) + frontmatter + CREDITS": 96, "Build verify + review + commit": 97} -->

## Kontext

Run 007a postavil lightbox infrastrukturu (`SpeciesGallery.astro` + `lib/lightbox.ts` + `styles/lightbox.css`) a pilotně ji nasadil na druh `cisarsky` (3 fotky). Run 007b je první content batch — postupný seed galerií pro zbývajících 16 druhů (4-5/run).

Výběr batche: dokončit **Aptenodytes** (patagonský) + celý rod **Pygoscelis** (kroužkový, oslí, uzdičkový). Po tomto runu bude hotových 5/17 druhů s galerií (cisarsky + patagonsky + 3× Pygoscelis). Zbývá 12 druhů na runy 007c/d/e.

## Zadání

- [x] Galerie Aptenodytes patagonský (3 fotky z Wikimedia Commons) + frontmatter + CREDITS
- [x] Galerie Pygoscelis kroužkový (3 fotky z Wikimedia Commons) + frontmatter + CREDITS
- [x] Galerie Pygoscelis oslí (3 fotky z Wikimedia Commons) + frontmatter + CREDITS
- [x] Galerie Pygoscelis uzdičkový (3 fotky z Wikimedia Commons) + frontmatter + CREDITS
- [x] Build verify (pnpm check + build) + review + commit

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

## Řešení (co a jak bylo uděláno)

- **patagonsky** — dospělec na Salisbury Plain (Andrew Shiva, CC BY-SA 4.0, Quality image), hnědě ochmýřená mláďata v Gold Harbour (Butterfly austral, CC BY-SA 3.0), juvenile během pelichání ve Fortuna Bay (Andrew Shiva, CC BY-SA 4.0, Quality image). Dokončuje rod Aptenodytes.
- **krouzkovy** — skok z vody na led (Rob Oo, CC BY 2.0), mláďata Paulet Island (Grant.C, CC BY 2.0), tři adultní ptáci Jižní Shetlandy (ravas51, CC BY-SA 2.0 — **Commons Featured picture, POTD 2023-11-26**).
- **osli** — hilltop kolonie na Murrell Farm, Falklandy (Nick/IntrepidExplorer82, CC BY 2.0), mládě na Sea Adventurer (Christopher Michel, CC BY 2.0), dospělec na procházce ve Waterboat Point (Liam Quinn, CC BY-SA 2.0).
- **uzdickovy** — kolonie Jižní Shetlandy (Christopher Michel, CC BY 2.0), dospělec s mláďaty na Seal Island (Lt. Philip Hall / NOAA, public domain, 1993-94), detail hlavy Half Moon Island (lwolfartist, CC BY 2.0, 2025).
- **Build verify** — `pnpm check` 0/0/0, `pnpm build` OK (86 obrázků optimalizováno → webp varianty pro 4 widths).
- **CREDITS.md** rozšířeno o 12 záznamů s plnou atribucí (autor, licence, zdroj Commons URL, originál URL, místo, datum pořízení, datum stažení).

## Poznámky

- **Bug v download skriptu:** `cd` mezi bash voláními perzistoval → druhý `cd src/assets/penguins/krouzkovy` z cwd patagonsky vytvořil nested `src/assets/penguins/patagonsky/src/assets/penguins/krouzkovy/...`. Opraveno `mv` operací. Pro 007c/d/e používat absolutní cesty nebo jediný `cd` per shell.
- **Commons Special:FilePath s `?width=N`** není garantovaný resize — MediaWiki scaler občas vrátí původní dimenzi (např. Fortuna Bay gallery-3 = 11 MB JPG). Astro Image pipeline ale při buildu vygeneruje správné webp varianty pro dodání — delivered size je malá.
- **WebFetch Commons Category:Quality_images_of_<taxon>** funguje pro patagonsky ale vrátil 404 pro adeliae — v těchto případech fallbackuju na hlavní kategorii + Featured pictures kategorii.
- **Volba fotek:** prioritizace variety (kolonie → mládě → detail/chování) a Quality/Featured images tam, kde jsou dostupné. Autoři se občas opakují (Andrew Shiva 2× u patagonsky, Christopher Michel 2× pro osli+uzdickovy) — acceptable pro breadth vs depth.
- **Stav Sprintu 002:** 5/17 druhů s galerií (cisarsky + 4 noví). Zbývá 12 druhů na runy 007c/d/e. Doporučený další batch: celý rod **Eudyptes** (6 druhů) rozdělený na 007c (3) + 007d (3), pak 007e = Megadyptes + Eudyptula + 4 Spheniscus zbývající (cisarsky z Aptenodytes je dokončen tímto runem — tam nepatří).
