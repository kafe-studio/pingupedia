# Run 006c: Seed Megadyptes + Eudyptula + Spheniscus (6 druhů)

**Status:** TODO
**Date:** 2026-04-19
**Sprint:** 002-species

## Kontext

Závěrečný batch Runu 006. Po předchozích runech je hotové:
- **Aptenodytes** (2/2): císařský, patagonský
- **Pygoscelis** (3/3): kroužkový, oslí, uzdičkový
- **Eudyptes** (6/6): patagonský, skalní jižní, skalní severní, snareský, sclaterův, zlatovlasý, royal

Tento batch uzavře seed seznam 3 posledními rody. Po 006c bude `/druhy` index obsahovat 17 karet — kompletní pokrytí aktuální taxonomie tučňáků.

1. **Megadyptes antipodes** — žlutooký (Yellow-eyed penguin / Hoiho), endemit Nového Zélandu. IUCN: Endangered
2. **Eudyptula minor** — nejmenší (Little penguin / Fairy penguin), Austrálie + Nový Zéland. IUCN: Least Concern
3. **Spheniscus demersus** — brýlový (African penguin), endemit jihoafrického pobřeží. IUCN: Critically Endangered (od 2024)
4. **Spheniscus humboldti** — Humboldtův, chilsko-peruánské pobřeží. IUCN: Vulnerable
5. **Spheniscus magellanicus** — magellanský, Patagonie + Falklandy. IUCN: Least Concern (populace klesající)
6. **Spheniscus mendiculus** — galapážský, endemit Galapág, **jediný tropický tučňák**. IUCN: Endangered

## Zadání

- [ ] Výzkum 6 druhů přes WebFetch — CS + EN Wikipedia + IUCN/BirdLife URLs
- [ ] Stažení 6 hero fotek z Wikimedia Commons + CREDITS záznamy (per druh adresář)
- [ ] Napsat 6 markdown souborů (`zlutooky.md`, `nejmensi.md`, `brylovy.md`, `humboldtuv.md`, `magellansky.md`, `galapazsky.md`)
- [ ] Build + astro check verify (17 druhů celkem)

## Slug rozhodnutí

- Tučňák žlutooký (M. antipodes) → `zlutooky`
- Tučňák nejmenší / maličký (E. minor) → `nejmensi`
- Tučňák brýlový (S. demersus) → `brylovy`
- Tučňák Humboldtův (S. humboldti) → `humboldtuv`
- Tučňák magellanský (S. magellanicus) → `magellansky`
- Tučňák galapážský (S. mendiculus) → `galapazsky`

## Soubory ke čtení

- `src/content/species/cisarsky.md` — vzor pro druh s kompletním CS Wiki (všech 5 zdrojů)
- `src/content/species/patagonsky.md` — vzor Aptenodytes, pravděpodobně podobný pattern pro Spheniscus demersus (4 zdroje)
- `src/content/species/osli.md` — vzor pro druh s CC BY-SA 2.0 fotkou
- `src/assets/penguins/CREDITS.md` — konvence licenčních záznamů
- `docs/sprints/002-species/run-006b2-eudyptes-remaining.done.md` — lessons (velká písmena adjektiv z vlastních jmen, description ≤ 220 zn., BirdLife loading)

## Poznámky

- **Rozložení práce:** 6 druhů je hodně pro jednu session — zvážit split na 006c1 (Megadyptes + Eudyptula + Galapázský = 3 unikátní rody) a 006c2 (zbývající 3 Spheniscus). Nebo 006c1 (Megadyptes + Eudyptula) a 006c2 (Spheniscus 4 druhy). **Rozhodnutí udělat na začátku session podle velikosti kontextu.**
- **IUCN status check:** Spheniscus demersus byl v 2024 přeřazen z Endangered do **Critically Endangered** — zkontrolovat aktuální stav na iucnredlist.org
- **CS Wikipedia:** pravděpodobně existují články pro brýlový, Humboldtův, magellanský, nejmenší — možná 4-5 zdrojů u těchto
- **Spheniscus mendiculus** je jediný tučňák hnízdící na rovníku a severně od něj — unikátní, dobře zvýraznit v textu
- **Megadyptes antipodes** má maorské jméno **hoiho** ("křičící pták") a je extrémně ohrožený — populace pod 1000 párů
- **Eudyptula minor** — taxonomický chaos: někteří rozlišují druh E. novaehollandiae (australský poddruh jako samostatný druh). BirdLife + IUCN pracují s jedním druhem, Wikipedia EN někdy rozlišuje. Jít s IUCN konvencí.
- **Lekce z 006b2:**
  - Popis ≤ 220 znaků pro bezpečnou rezervu (240 je hard limit)
  - Velká písmena v přivlastňovacích adjektivech z vlastních jmen (Humboldtův, Sclaterův)
  - BirdLife factsheet má dynamický loading — tahat data z Wiki/IUCN
  - IUCN assessment IDs musí být distinct per druh
  - Gramatická shoda neutra (peří/péra)
- **Fotky:** Wikimedia Commons — `Category:Megadyptes_antipodes`, `Category:Eudyptula_minor`, `Category:Spheniscus_demersus`, `Category:Spheniscus_humboldti`, `Category:Spheniscus_magellanicus`, `Category:Spheniscus_mendiculus`
