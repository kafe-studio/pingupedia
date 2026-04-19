# Run 006: Seed všech druhů tučňáků

**Status:** TODO
**Date:** 2026-04-19
**Sprint:** 002-species

## Kontext

Runy 004 (`/druhy` index) + 005 (`/druhy/[slug]` detail) postavily celé UI. Zatím existuje jeden druh (`cisarsky`). Tento run naseeduje všech ~18 druhů tučňáků — každý s markdown souborem v `src/content/species/<slug>.md`, frontmatterem validovaným zod schématem, alespoň 2 ověřenými zdroji, hero fotkou s licencí v `src/assets/penguins/<slug>/hero.jpg` a CREDITS.md záznamem. Body text populárně-naučný (2–4 odstavce). Po dokončení je `/druhy` index plný a každý druh má funkční detail.

## Aktuální taxonomie (18 druhů)

1. **Aptenodytes** — císařský (✓ hotový), patagonský
2. **Pygoscelis** — kroužkový, oslí, uzdičkový
3. **Eudyptes** — skalní (rockhopper severní + jižní = 2 druhy), chocholatý, zlatovlasý, royal, Sclaterův
4. **Megadyptes** — antipodský (žlutooký)
5. **Eudyptula** — nejmenší (modrý)
6. **Spheniscus** — Humboldtův, magellanský, brýlový (africký), Galapážský

Celkem 17 druhů + 1 hotový = 18. Ověřit proti IUCN Red List current list (možné že rockhopper sever/jih se počítá jako 1 nebo 2).

## Zadání

Rozsáhlý obsahový run, **rozdělit na batch-y**. Tenhle run nechá Claude spustit 3 batche:

- [ ] Batch 1: Aptenodytes (patagonský) + Pygoscelis (3 druhy) — 4 druhy + CREDITS
- [ ] Batch 2: Eudyptes (5–6 druhů) + Megadyptes (antipodský) — 6–7 druhů + CREDITS
- [ ] Batch 3: Eudyptula (nejmenší) + Spheniscus (4 druhy) — 5 druhů + CREDITS
- [ ] Ověření taxonomie proti IUCN Red List + finální ladění
- [ ] Build + typecheck verify (všech 18 druhů se musí prerenderovat)

## Soubory ke čtení

- `src/content.config.ts` — schema (povinné pole, validation)
- `src/content/species/cisarsky.md` — vzor markdown souboru druhu
- `src/assets/penguins/CREDITS.md` — konvence licenčních záznamů
- `docs/PROJECT.md` sekce "Fotky a licence" — pravidla pro zdroje fotek

## Poznámky k obsahu

- **Každý druh min 2 zdroje** — vynucuje schema. Doporučeno: Wikipedia CS + EN + IUCN + BirdLife (4 zdroje) pro robustnost.
- **Fotky:** Wikimedia Commons CC-BY / public domain. Vyhledat přímo na `commons.wikimedia.org/wiki/Category:<Species>_<latin>`. Za každou fotku záznam v CREDITS.md.
- **Tón:** populárně-naučný, pro děti i dospělé. Historické souvislosti (objevování, expedice) kde je to zajímavé.
- **Pozor na no-crop** — `hero.src` musí být soubor v per-druh adresáři, ne ořezaný.
- **Zdrojová data:** IUCN status, velikost, rozšíření a populace se berou z IUCN Red List (aktuální k 2026). Lifespan wild/captivity z Wikipedie.

## Rozhodnutí k seed strategii

Tento run je extrémně rozsáhlý (18 × ~50 řádků markdown + 17 fotek s licencemi). Zvážit rozdělení na Run 006a/b/c podle batche, nebo dělat v jedné session jen batch 1 a zbytek v další.
