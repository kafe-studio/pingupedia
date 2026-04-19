# Run 006c2: Seed zbývající 3 Spheniscus (brýlový, Humboldtův, magellanský)

**Status:** IN-PROGRESS
**Date:** 2026-04-19
**Sprint:** 002-species
**Dashboard Run:** 20

<!-- dashboard-tasks: {"Výzkum 3 druhů (Wiki CS + EN + IUCN)": 84, "Stáhnout 3 hero fotky + CREDITS záznamy": 85, "Napsat 3 markdown soubory (brylovy, humboldtuv, magellansky)": 86, "Build + astro check verify (17 druhů)": 87} -->


## Kontext

Druhá polovina rozděleného runu 006c. 006c1 pokryl 3 unikátní rody (Megadyptes + Eudyptula + galapážský). 006c2 dodá 3 zbývající Spheniscus — celý rod se pak uzavře jako 4/4.

Stav před runem: **14 druhů** (Aptenodytes 2/2, Pygoscelis 3/3, Eudyptes 6/6, Megadyptes 1/1, Eudyptula 1/1, Spheniscus 1/4).

Tento batch dodá:

1. **Spheniscus demersus** — brýlový (African penguin / jackass penguin), endemit jihoafrického pobřeží. IUCN: **Critically Endangered** (od 2024, přeřazen z EN). Populace pod 10 000 hnízdních párů.
2. **Spheniscus humboldti** — Humboldtův, pobřeží Chile a Peru. IUCN: Vulnerable. Závislý na Humboldtově proudu, populace citlivá na El Niño podobně jako galapážský.
3. **Spheniscus magellanicus** — magellanský (Magellanic penguin), Patagonie + Falklandy + jižní Brazílie. IUCN: Least Concern, ale populace klesá.

Po 006c2: **17 druhů** = kompletní pokrytí aktuální taxonomie tučňáků. Pak Run 007 (fotogalerie per druh).

## Zadání

- [ ] Výzkum 3 druhů přes WebFetch — CS + EN Wikipedia + IUCN/BirdLife (CS Wiki existuje pravděpodobně pro všechny)
- [ ] Stažení 3 hero fotek z Wikimedia Commons + CREDITS záznamy (per druh adresář)
- [ ] Napsat 3 markdown soubory (`brylovy.md`, `humboldtuv.md`, `magellansky.md`)
- [ ] Build + astro check verify (17 druhů celkem)

## Slug rozhodnutí

- Tučňák brýlový (S. demersus) → `brylovy`
- Tučňák Humboldtův (S. humboldti) → `humboldtuv`
- Tučňák magellanský (S. magellanicus) → `magellansky`

## Soubory ke čtení

- `src/content/species/galapazsky.md` — vzor Spheniscus se 4 zdroji
- `src/content/species/patagonsky.md` — vzor druhu s CS Wiki a 4 zdroji
- `src/assets/penguins/CREDITS.md` — konvence licenčních záznamů
- `docs/sprints/002-species/run-006c1-unique-genera.done.md` — lessons (typografické uvozovky v YAML parse error!)

## Poznámky

- **Spheniscus demersus** byl v 2024 přeřazen z Endangered na **Critically Endangered** — ověřit aktuální IUCN URL a uvést v historicalNotes
- **Spheniscus humboldti** — závislý na Humboldtově proudu, populace oscilující s El Niño (podobný pattern jako galapážský)
- **Spheniscus magellanicus** — největší a nejrozšířenější ze Spheniscus, hnízdí v obrovských koloniích (Punta Tombo v Argentině přes 200 000 párů)
- **Velká písmena:** Humboldtův (tučňák odvozený od jména Humboldt — **vždy velké H**), Magellanský (od jména Magellan) — pozor u adjektiv i v substantivovaném tvaru
- **CS Wikipedia:** existují všechny 3 články s jistotou → 4 zdroje per druh
- **Fotky:** Wikimedia Commons — `Category:Spheniscus_demersus`, `Category:Spheniscus_humboldti`, `Category:Spheniscus_magellanicus`. Všechny 3 druhy jsou populární a v Commons bude množství kvalitních fotek.
- **Lekce z 006b2 + 006c1 (aplikovat):**
  - **NIKDY typografické uvozovky ve YAML frontmatteru** (description, historicalNotes…) — parse error. Jen ASCII nebo bez uvozovek. V body textu OK.
  - Description ≤ 220 zn. (240 hard limit)
  - Velká písmena v přivlastňovacích adjektivech z vlastních jmen (Humboldtův)
  - BirdLife má dynamický loading — použít jen jako URL
  - IUCN assessment IDs distinct per druh
  - Geografické detaily (státy, ostrovy) křížově ověřovat (Phillip Island je Victoria ne Tasmánie!)
  - Gramatická shoda neutra (peří/péra)
- **Po 006c2:** seed kompletní (17 druhů). Spustit `/audit` pro kontrolu IUCN URLs, assessment IDs a faktické přesnosti napříč všemi 17 druhy. Pak 007 (galerie).
