# Run 006b: Seed Aptenodytes patagonský + Eudyptes (6–7 druhů)

**Status:** TODO
**Date:** 2026-04-19
**Sprint:** 002-species

## Kontext

Run 006a naseedovala 3 druhy rodu Pygoscelis. Tenhle batch dodá 6–7 dalších druhů:

1. **Aptenodytes patagonicus** — patagonský (královský) tučňák
2. **Eudyptes chrysocome** — rockhopper jižní (skalní)
3. **Eudyptes moseleyi** — rockhopper severní (skalní severní) — někdy považovaný za poddruh, ale IUCN 2022+ jako samostatný druh
4. **Eudyptes robustus** — snaresky (Snaresův chocholatý)
5. **Eudyptes chrysolophus** — zlatovlasý
6. **Eudyptes schlegeli** — královský (royal) — někdy považovaný za poddruh zlatovlasého
7. **Eudyptes sclateri** — Sclaterův (chocholatý velký)

Taxonomie se mírně liší mezi zdroji — ověřit na IUCN current list. Pokud některý druh není IUCN recognized 2026, ponechat jen 6.

## Zadání

- [ ] Výzkum 6–7 druhů (Aptenodytes patagonský + rod Eudyptes) přes WebFetch — CS Wikipedia + BirdLife
- [ ] Stažení hero fotek z Wikimedia Commons + CREDITS záznamy
- [ ] Napsat 6–7 markdown souborů (`patagonsky.md`, `skalni-jizni.md`, `skalni-severni.md`, `snaresky.md`, `zlatovlasy.md`, `royal.md`, `sclateruv.md`)
- [ ] Build + astro check verify

## Slug návrh

- Tučňák patagonský → `patagonsky`
- Tučňák skalní jižní → `skalni-jizni`
- Tučňák skalní severní → `skalni-severni`
- Tučňák snaresky → `snaresky`
- Tučňák zlatovlasý → `zlatovlasy`
- Tučňák královský → `kralovsky` (pozor na konflikt s patagonským, který se také nazývá "královský")

**Rozhodnutí slug** — některé české názvy kolidují:
- Patagonský tučňák se v některých českých zdrojích nazývá "královský tučňák" (protože je druhý největší po císařském)
- Eudyptes schlegeli je v angl. "royal penguin" a česky někdy také "královský"

Doporučení: držet se IUCN/Wikipedia EN nomenklatury pro jednoznačnost:
- `patagonsky` → Aptenodytes patagonicus (King penguin)
- `royal` → Eudyptes schlegeli (Royal penguin)

Toto v run 006b explicitně rozhodnout na začátku.

## Poznámky

- **Fotky:** Wikimedia Commons — Category:Aptenodytes_patagonicus, Category:Eudyptes_*
- **Zdroje:** Wiki CS + EN + IUCN + BirdLife (stejný pattern jako 006a)
- **IUCN URLs** — Run 006a poznamenal že IUCN blokuje WebFetch. Použít species IDs z IUCN search (pre-known) nebo z BirdLife page links na IUCN.
