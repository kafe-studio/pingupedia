# Run 006c2: Seed zbývající 3 Spheniscus (brýlový, Humboldtův, magellanský)

**Status:** DONE
**Date:** 2026-04-19
**Sprint:** 002-species
**Dashboard Run:** 20
**Session:** Finální batch Run 006. Po tomto runu je celý seed Sprintu 002 kompletní — **17/17 druhů** a rod Spheniscus uzavřen 4/4.

<!-- dashboard-tasks: {"Výzkum 3 druhů (Wiki CS + EN + IUCN)": 84, "Stáhnout 3 hero fotky + CREDITS záznamy": 85, "Napsat 3 markdown soubory (brylovy, humboldtuv, magellansky)": 86, "Build + astro check verify (17 druhů)": 87} -->

## Kontext

Druhá polovina rozděleného runu 006c. 006c1 pokryl 3 unikátní rody (Megadyptes + Eudyptula + galapážský). 006c2 dodal 3 zbývající Spheniscus — celý rod se tím uzavřel jako 4/4.

Stav po runu: **17 druhů** = kompletní pokrytí aktuální taxonomie. Kompletní rody: Aptenodytes 2/2, Pygoscelis 3/3, Eudyptes 6/6, Megadyptes 1/1, Eudyptula 1/1, Spheniscus 4/4.

## Zadání (co se mělo udělat)

- [x] Výzkum 3 druhů přes WebFetch — CS + EN Wikipedia + IUCN/BirdLife
- [x] Stažení 3 hero fotek z Wikimedia Commons + CREDITS záznamy (per druh adresář)
- [x] Napsat 3 markdown soubory (`brylovy.md`, `humboldtuv.md`, `magellansky.md`)
- [x] Build + astro check verify (17 druhů celkem)

## Řešení (co a jak bylo uděláno)

**Výzkum → 4 zdroje per druh (CS Wiki existuje pro všechny 3):**
- `Spheniscus demersus` — první ilustroval Edwards 1747, Linné 1758 popsal jako *Diomedea demersa*, Brisson 1760 zařadil do Spheniscus. **2024: přeřazen z EN na CR** — populace pod 20 000 dospělých (pokles ze 4 milionů v 19. století). Kolaps kvůli přerybaření sardinek a oteplování Benguelského proudu.
- `Spheniscus humboldti` — popsal Meyen 1834, pojmenován po Alexandru von Humboldtovi. ~23 800 dospělých (IUCN 2020), 80 % v chráněných oblastech Chile. Citlivý na El Niño — 1982-83 propad o 65 %.
- `Spheniscus magellanicus` — popsal Forster 1781, pojmenován po Magellanovi (jehož posádka 1520 první Evropané spatřili tučňáky). >1,3 mil. hnízdních párů, Punta Tombo >200 000. LC, dlouhodobý trend klesající.

**Fotky** (všechny staženy 2026-04-19 s pingupedia UA):
- `src/assets/penguins/brylovy/hero.jpg` — Bernard Gagnon, CC BY-SA 4.0, Boulders Beach 2017, 2000px thumb (878 KB)
- `src/assets/penguins/humboldtuv/hero.jpg` — Pete Cable, CC BY 2.0, Islas Ballestas Peru 2013, originál 3264×2448 (1.2 MB)
- `src/assets/penguins/magellansky/hero.jpg` — Diego Delso, CC BY-SA 3.0, Seno Otway Chile 2007, 2000px thumb (1.6 MB)
- `src/assets/penguins/CREDITS.md` — 3 nové záznamy podle existující konvence

**Markdown soubory (všechny prošly schema validací):**
- `src/content/species/brylovy.md` (51 ř.) — Spheniscus demersus, CR, 4 zdroje, 2024 uplisting, populační propad
- `src/content/species/humboldtuv.md` (53 ř.) — Spheniscus humboldti, VU, 4 zdroje, Humboldtův proud, El Niño
- `src/content/species/magellansky.md` (53 ř.) — Spheniscus magellanicus, LC, 4 zdroje, Punta Tombo 200k+ párů, Magellanovo objevení 1520

**Build verify:**
- `pnpm check` → 0 errors / 0 warnings / 0 hints (23 files)
- `pnpm build` → úspěch, 17 druhů prerenderovaných (+ /druhy index)

**Review odchytil 4 issues (2P + 2W), všechny opraveny v review pass:**
- **PROBLEM brylovy.md:16** — překlep `pukliných` → `puklinách` (locativ pl. od *puklina*).
- **PROBLEM humboldtuv.md:27** — zbytečně odstraněná španělská diakritika `pajaro-nino` → `pájaro-niño`. YAML podporuje Unicode (ñ v "El Niño" funguje), chybně jsem aplikoval pravidlo „typografické uvozovky mimo YAML".
- **WARNING humboldtuv.md:20** — zaměnění ryb: *Scomberesox* (makrelky/sauries) ≠ "mořské jehly" (Belonidae). Oprava: "makrelku severoatlantskou (*Scomberesox saurus*) a jehlici mořskou (*Belone*)".
- **WARNING magellansky.md:51** — *nutrie* (Myocastor, vodní hlodavec) na suchém Punta Tombo nežije; správně **mara patagonská** (Dolichotis patagonum).
- **WARNING magellansky.md:53** — sporná věta "Cookovy plavby objevily druhy na antarktických vodách" — ve skutečnosti Forster popsal během druhé Cookovy plavby, Antarktida objevena až 1820 (Bellingshausen). Přeformulováno na "o více než dvě a půl století dříve, než druh získal vědecké jméno".

## Poznámky

- **NOVÁ LEKCE — Unicode v YAML:** YAML double-quoted stringy **podporují Unicode plně** (ñ, á, é, atd.). Jediné co NEFUNGUJE jsou typografické uvozovky `„…"` (U+201E / U+201D). Omylem jsem v humboldtuv.md odstranil i běžnou španělskou diakritiku (pájaro-niño), ačkoli description už používá "El Niño" bez problémů. Pro příští runy: v YAML se vyhýbat POUZE typografickým uvozovkám, ostatní Unicode znaky (španělština, ñ, é, á) jsou OK.
- **Faktické lekce k zapamatování:**
  - Ekologie kolonií: Punta Tombo = **mary patagonské** (Dolichotis), ne nutrie. Guanako ano. Suché polopouštní klima.
  - Ryby: *Scomberesox* = makrelky/sauries (ne "mořské jehly"); *Belone* = jehlice mořské. Nezaměňovat.
  - Historie objevů: Forster popsal tučňáka magellanského, nejmenšího, skalního jižního a císařského všechny v roce 1781 po návratu z druhé Cookovy plavby. Antarktické druhy (Aptenodytes forsteri, Pygoscelis) pak popsal on i jeho nástupci.
  - Spheniscus demersus 2024 CR — aktuální IUCN URL: `https://www.iucnredlist.org/species/22697810/256021744`, dostat správně do zdrojů.
- **Lekce z 006c1 úspěšně aplikované:**
  - ✓ Description ≤ 220 zn. (všechny 3: 192-198 zn.)
  - ✓ Žádné typografické uvozovky v YAML frontmatteru
  - ✓ Velká písmena v adjektivech z vlastních jmen (Humboldtův)
  - ✓ IUCN assessment IDs distinct per druh (22697810, 22697817, 22697822)
  - ✓ Geografické detaily křížově ověřené (Boulders Beach = Simon's Town; Port Elizabeth = dnes Gqeberha)
- **Kompletní seed Sprintu 002 = 17 druhů naseedováno.** Dále:
  - **Doporučené:** spustit `/audit` na celý content collection — kontrola IUCN URLs, assessment IDs, faktické přesnosti napříč 17 druhy, konzistence stylu a délky textů. Tester může vygenerovat checklist k testování.
  - **Plán:** Po `/audit` (+ případný `/fix`) pokračovat Runem 007 — fotogalerie per druh (lightbox, responzivní, bez ořezu) ze Sprint 002.
  - Sprint 002 ještě NENÍ hotov (pending Run 007).

## Commit

- `ed4569f` Run 006c2: seed zbývající 3 Spheniscus (brylovy, humboldtuv, magellansky)
