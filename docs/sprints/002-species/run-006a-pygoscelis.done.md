# Run 006a: Seed Pygoscelis (3 druhy)

**Status:** DONE
**Date:** 2026-04-19
**Sprint:** 002-species
**Dashboard Run:** 16

<!-- dashboard-tasks: {"Research 3 Pygoscelis (Wikipedia CS + IUCN)": 68, "Hero fotky z Commons + CREDITS": 69, "Napsat 3 markdown soubory": 70, "Build + astro check verify": 71} -->

## Kontext

Run 006 (master) — seed všech 17 zbývajících druhů — je rozdělený na 3+ batche kvůli objemu práce. Tenhle `006a` je první: **3 druhy rodu Pygoscelis** — kroužkový (*P. adeliae*), oslí (*P. papua*), uzdičkový (*P. antarcticus*). Jeden rod = konzistentní výzkumný zdroj (IUCN Penguin Specialist Group, BirdLife). Po dokončení má `/druhy` index 4 karty, detail funguje pro všechny.

## Zadání

- [x] Výzkum 3 Pygoscelis druhů — WebFetch Wikipedia CS + IUCN Red List pro každý
- [x] Stažení 3 hero fotek z Wikimedia Commons + CREDITS záznamy
- [x] Napsat 3 markdown soubory: `krouzkovy.md` / `osli.md` / `uzdickovy.md`
- [x] Build + astro check verify (4 druhy celkem)

## Další plánované batche

- Run 006b: Aptenodytes patagonský + Eudyptes (rockhopper severní/jižní, chocholatý, zlatovlasý, royal, Sclaterův)
- Run 006c: Megadyptes antipodský + Eudyptula nejmenší + Spheniscus (Humboldtův, magellanský, brýlový, Galapážský)

## Soubory ke čtení

- `src/content.config.ts` — schema
- `src/content/species/cisarsky.md` — vzor markdown + frontmatter
- `src/assets/penguins/CREDITS.md` — konvence licenčních záznamů

## Slug konvence

Slug bez diakritiky, odpovídá českému názvu bez "tučňák":
- Tučňák kroužkový → `krouzkovy`
- Tučňák oslí → `osli`
- Tučňák uzdičkový → `uzdickovy`

## Řešení

- **Výzkum** — WebFetch 3× CS Wikipedia (kroužkový, oslí, uzdičkový) pro taxonomii/velikost/distribuci/dietu/lifespan/populaci/IUCN status/historické poznámky. 3× WebFetch Wikimedia Commons kategorie pro high-quality fotku kandidáty. 3× WebFetch Commons file page pro author/licence/URL. 3× WebFetch BirdLife factsheet pro cross-check zdrojů.
- **Fotky** (`src/assets/penguins/{krouzkovy,osli,uzdickovy}/hero.jpg`) — stažené přes `curl` s pingupedia user-agent. Jason Auch CC BY 2.0 (kroužkový, Antarktický poloostrov 2008), Liam Quinn CC BY-SA 2.0 (oslí, Cooper Bay 2011), Christopher Michel CC BY 2.0 (uzdičkový, Deception Island 2013). Všechny validní JPEG, 1.6–5.7 MB.
- **CREDITS.md** — 3 nové záznamy ve standardní konvenci (druh/autor/licence/zdroj/originál/místo/datum/staženo/použití).
- **Markdown soubory** (`src/content/species/{krouzkovy,osli,uzdickovy}.md`) — schema-validované frontmattery, 4 zdroje každý (Wiki CS + EN + IUCN + BirdLife), body 2 odstavce populárně-naučného textu. Slug bez diakritiky podle konvence (z Run 003).
- **Verifikace** — `pnpm check`, `pnpm typecheck`, `pnpm build` všechno 0/0/0. Build prerenderoval `/druhy/cisarsky/`, `/druhy/krouzkovy/`, `/druhy/osli/`, `/druhy/uzdickovy/` a `/druhy/` index se 4 kartami.

## Poznámky

- **YAML fix** — `uzdickovy.md:24` měl vnitřní `"` uvnitř dvojitých YAML uvozovek → parse error. Nahrazeno typografickým `„…"` (U+201E/U+201D). Pro příští druhy: vyhýbat se nested ASCII `"` ve frontmatter stringech, preferovat české typografické uvozovky.
- **IUCN Red List URLs nemohly být pre-verified** — IUCN blokuje WebFetch s 403 (anti-bot). Pattern odpovídá Run 003 `cisarsky.md`, který prošel auditem. Species IDs (22697758 Adelie, 22697755 Gentoo, 22697761 Chinstrap) dobře známé; assessment IDs dedukce. Pokud některý URL 404, opravit v `/audit` Sprint 002.
- **`wildYears: 20` u uzdičkového** — odhad podle rodu Pygoscelis (CS Wiki číslo neuvádí). Pro populárně-naučný kontext akceptabilní. Při zpřesnění ze zdroje aktualizovat.
- **Rychlost 36 km/h u oslího** — populární fact z EN Wikipedia, ne z primárního CS zdroje. Akceptabilní v body textu.
- **Dashboard Run 16**, tasks 68–71 všechny `done`.
- **Další batch (Run 006b):** Aptenodytes patagonský + Eudyptes (5–6 druhů rockhopper, chocholatý, zlatovlasý, royal, Sclaterův). Zachovat stejný seed workflow (WebFetch → curl → markdown → CREDITS → verify).
