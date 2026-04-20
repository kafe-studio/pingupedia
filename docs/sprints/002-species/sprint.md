# Sprint 002: Druhy

**Status:** DONE
**Dashboard Sprint:** 4
**Dokončeno:** 2026-04-20 (Run 007e2 — 17/17 druhů s hero + galerií)
**Cíl:** Veřejné stránky `/druhy/*` — index se seznamem druhů, detail s fakty/zdroji/galerií, seed všech ~18 druhů tučňáků.
**Runy:** 004–007

## Scope

Sprint 001 položil datový model (`species` content collection, `cisarsky.md` jako první druh). Sprint 002 postaví nad tím veřejné UI:

- `/druhy` — index se seznamem všech druhů (karta s hero fotkou bez ořezu, název, rod, IUCN status, krátký popis).
- `/druhy/[slug]` — detail druhu (hero, fakta, distribuce, strava, historie, zdroje, případně galerie).
- Seed všech druhů tučňáků podle aktuální taxonomie — každý s ověřenými zdroji a alespoň jednou hero fotkou s licencí.
- Fotogalerie per druh (responzivní, lightbox bez ořezu).

Po dokončení je pingupedia použitelná jako encyklopedie — návštěvník vidí všechny druhy, proklikne se do detailu, vidí fotky bez ořezu a ověřené zdroje.

## Runy

- [x] Run 004 — `/druhy` index (karty bez ořezu)
- [x] Run 005 — `/druhy/[slug]` detail (hero, fakta, historie, zdroje)
- [x] Run 006 — seed všech druhů tučňáků s texty + fotkami + zdroji (006a+006b1+006b2+006c1+006c2 = 17 druhů)
- [x] Run 007 — fotogalerie per druh (lightbox + 17 druhů seeded v runech 007a–007e2)
