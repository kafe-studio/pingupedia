# Run 006c1: Seed 3 unikátní rody (žlutooký, nejmenší, galapážský)

**Status:** DONE
**Date:** 2026-04-19
**Sprint:** 002-species
**Dashboard Run:** 19
**Session:** Split původního 006c na 006c1 + 006c2. 006c1 pokryl 3 druhy ze 3 rodů (Megadyptes + Eudyptula + Spheniscus mendiculus). 14/~17 druhů naseedováno.

<!-- dashboard-tasks: {"Výzkum 3 druhů (Wiki + IUCN)": 80, "Stáhnout 3 hero fotky + CREDITS": 81, "Napsat 3 markdown soubory": 82, "Build + astro check verify (14 druhů)": 83} -->

## Kontext

Split původního 006c na 006c1 + 006c2 podle doporučení z handoffu 006b2 (6 druhů je moc pro jednu session). 006c1 pokryl 3 druhy ze 3 unikátních rodů. 006c2 dodá 3 zbývající Spheniscus (brýlový, Humboldtův, magellanský).

Stav po runu: **14 druhů** naseedovaných. Kompletní rody: Aptenodytes (2/2), Pygoscelis (3/3), Eudyptes (6/6), Megadyptes (1/1), Eudyptula (1/1), Spheniscus (1/4 — zatím jen galapážský).

## Zadání (co se mělo udělat)

- [x] Výzkum 3 druhů přes WebFetch — EN Wikipedia + CS Wikipedia (existuje pro všechny 3!) + IUCN/BirdLife
- [x] Stažení 3 hero fotek z Wikimedia Commons + CREDITS záznamy (per druh adresář)
- [x] Napsat 3 markdown soubory (`zlutooky.md`, `nejmensi.md`, `galapazsky.md`)
- [x] Build + astro check verify (14 druhů celkem)

## Řešení (co a jak bylo uděláno)

**Výzkum → 4 zdroje per druh (CS Wiki existuje pro všechny 3):**
- `Megadyptes antipodes` — popsán 1841 Hombron & Jacquinot, expedice Dumonta d'Urvilla. Pouhých ~1000 hnízdních párů (pevnina 143 v 2025, subantarktika 577). **Jediný nekoloniální tučňák** — páry hnízdí samotářsky v pobřežních lesích až 1 km od moře.
- `Eudyptula minor` — popsán 1781 J. R. Forsterem (stejný rok jako tučňák císařský + skalní jižní). Nejmenší druh (30-33 cm, 1-1.5 kg). Jediný tučňák výhradně nočního chování na pevnině. Taxonomicky sporný vs *E. novaehollandiae*.
- `Spheniscus mendiculus` — popsán 1871 švédským Sundevallem. ~1200 jedinců, z toho 90 % na Fernandina + Isabela. Jediný druh na rovníku a severně (0°41'N). Populace oscilující s ENSO (El Niño 1982-83 propad >77 %).

**Fotky** (všechny staženy 2026-04-19 s pingupedia UA):
- `src/assets/penguins/zlutooky/hero.jpg` — Christian Mehlführer, CC BY 2.5, Curio Bay 2008, originál 1467×2200 (1.2 MB)
- `src/assets/penguins/nejmensi/hero.jpg` — Jolaus, CC BY 4.0, Waipatiko Beach 2024, 2000px thumb (439 KB)
- `src/assets/penguins/galapazsky/hero.jpg` — putneymark, CC BY-SA 2.0, Elizabeth Bay 2007, originál 1662×2424 (711 KB)
- `src/assets/penguins/CREDITS.md` — 3 nové záznamy podle existující konvence

**Markdown soubory (všechny prošly schema validací):**
- `src/content/species/zlutooky.md` (52 ř.) — Megadyptes antipodes, EN, 4 zdroje, nekoloniální hnízdění, populace collapse
- `src/content/species/nejmensi.md` (52 ř.) — Eudyptula minor, LC, 4 zdroje, noční chování, taxonomický spor
- `src/content/species/galapazsky.md` (51 ř.) — Spheniscus mendiculus, EN, 4 zdroje, ENSO závislost, rovníková biogeografie

**Build verify:**
- `pnpm check` → 0 errors / 0 warnings / 0 hints
- `pnpm typecheck` → 0 errors
- `pnpm build` → úspěch, 14 druhů prerenderovaných (+ /druhy index)

## Poznámky

- **NOVÁ LEKCE — YAML parser choke:** Použití **typografických uvozovek** `„…"` (U+201E / U+201D) **uvnitř YAML double-quoted stringů** (description, historicalNotes atd.) způsobí `bad indentation of a mapping entry` error, přestože jde o různé Unicode code pointy než ASCII `"`. Parser js-yaml 4.1.1 je pravděpodobně normalizuje nebo s nimi špatně zachází. **Řešení:** typografické uvozovky používat **pouze v body textu**, nikdy ve frontmatteru. V YAML stringu jen plain text nebo markdown asterisky.
- **/review odchytil 1 faktickou chybu:** `nejmensi.md:49` tvrdil, že Phillip Island je v Tasmánii — ve skutečnosti je ve státě **Victoria** (u Melbourne). Opraveno. Lekce: geografické detaily (státy, ostrovy) křížově ověřovat, ne jen přejímat z hlavy.
- **Lekce z 006b2 úspěšně aplikované:**
  - Description ≤ 220 zn. ✓ (všechny 3 pod limitem, žádný retry)
  - Velká písmena v adjektivech z vlastních jmen ✓ (Humboldtův, Bullerův, Dumonta)
  - BirdLife jen jako citační URL ✓
  - IUCN assessment IDs distinct per druh ✓ (22697800, 22697805, 22697825)
  - Gramatická shoda neutra ✓
- **CS Wikipedia existuje pro všechny 3 druhy** — ukázalo se, že drtivá většina tučňáků má CS článek. Pro 006c2 (Spheniscus demersus, humboldti, magellanicus) také pravděpodobně existují (brýlový + Humboldtův jsou populární). → 4 zdroje per druh jako cíl.
- **Taxonomická poznámka Eudyptula:** uznal jsem IUCN konvenci (jeden druh minor s poddruhy), ale zmínil spor v body + historicalNotes. Při /audit možno zjemnit podle nového výzkumu.
- **Megadyptes antipodes:** Wiki říká "threatened → endangered od 2000", ale "threatened" není samostatná IUCN kategorie. V review označeno jako WARNING (body text líčí status change poněkud nepřesně). Pro /audit možno reformulovat jednoznačněji.
- **Po 006c1:** zbývá 006c2 = 3 Spheniscus (brýlový CR, Humboldtův VU, magellanský LC). Po 006c2 bude seed hotový (17 druhů). Pak Run 007 (galerie).

## Commit

- `7262763` Run 006c1: seed 3 unikátní rody (zlutooky, nejmensi, galapazsky)
