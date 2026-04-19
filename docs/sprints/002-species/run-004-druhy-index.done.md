# Run 004: `/druhy` index

**Status:** DONE
**Date:** 2026-04-19
**Sprint:** 002-species
**Dashboard Run:** 14
**Session:** První run Sprint 002 — veřejná stránka `/druhy` s kartami druhů (zatím 1 druh, ale UI připravené na seed Run 006).

<!-- dashboard-tasks: {"Bootstrap Sprint 002 (sprint.md + run-004 file)": 60, "SpeciesCard komponenta (mcp)(bp)": 61, "/druhy/index.astro getCollection + grid (mcp)": 62, "Typecheck + astro check verify": 63} -->

## Kontext

Homepage i Navbar odkazují na `/druhy/`, ale stránka zatím neexistuje — po kliknutí 404. Sprint 001 Run 003 založil `species` collection, zatím je v ní jeden druh `cisarsky.md`. Tenhle run dá index do veřejného provozu tak, aby se do něj Sprint 002 Run 006 (seed všech druhů) mohl bez úprav nasypat.

## Zadání

- [x] Sprint 002 bootstrap — `docs/sprints/002-species/sprint.md` + tento run file
- [x] `src/components/species/SpeciesCard.astro` — karta druhu (hero přes `NoCropImage`, nameCs, nameLat, genus, IUCN status badge, description)
- [x] `src/pages/druhy/index.astro` — `getCollection("species")` + grid (1/2/3 sloupce responzivně), prázdný stav pokud žádný druh, řazení podle `nameCs` (cs lokalita)
- [x] Typecheck + astro check verify (0/0/0)

## Plán souborů

- `src/components/species/SpeciesCard.astro` — cca 60 řádků, max 150
- `src/pages/druhy/index.astro` — cca 80 řádků, max 200

Žádný soubor se nepřeplňuje, rozdělení je čisté: karta v komponentě, stránka orchestruje data a layout.

## Řešení

- **Sprint 002 bootstrap** — `docs/sprints/002-species/sprint.md` (25 řádků) s audited scope 4 runů (Druhy index → detail → seed → galerie). Dashboard Sprint 4 založen.
- **SpeciesCard komponenta** (`src/components/species/SpeciesCard.astro`, 67 řádků) — přijímá `CollectionEntry<"species">`, renderuje kartu s hero přes `NoCropImage` (ratio 4/3, sizes responzivně), jménem cs/lat, rodem, IUCN badge a description (line-clamp-3). IUCN status má českou legendu (`Málo dotčený`, `Téměř ohrožený`, …) + barevný tón per status (emerald → red). Celá karta je odkaz na `/druhy/<id>/`.
- **Stránka `/druhy/`** (`src/pages/druhy/index.astro`, 57 řádků) — `prerender = true`, `getCollection("species")` + `localeCompare(nameCs, "cs")` sort, grid 1/2/3 sloupce responzivně. Empty state pro nulu druhů, jinak count + grid. Headline + perex s motivací encyklopedie.
- **Verifikace** — `pnpm check`, `pnpm typecheck`, `pnpm build` — všechno 0/0/0. Build prerenderoval `/druhy/index.html`.

## Poznámky

- **Detail stránka `/druhy/[slug]/` ještě neexistuje** — Run 005. Kliknutí na kartu dnes končí 404. Záměrné, sprint file to reflektuje.
- **Filtr podle rodu** byl v PLAN.md původního scope Run 004, ale při 1 druhu nemá smysl — přesouvá se na Sprint 004 Run 012 (všechny filtry najednou). PLAN.md řádek se aktualizoval.
- **Astro API fallback** — Context7 quota pořád vyčerpaná (obnova 1. 5.), `getCollection` + `CollectionEntry` ověřeny přes `.astro/content.d.ts:22,39-46` (auto-generated types).
- **Tailwind 4 line-clamp** je core utility (od v3.3+), není potřeba plugin.
- **`role="list"` na `<ul>`** je defensive — Safari odstraňuje implicit role u seznamů s `list-style: none`, což se může dostat přes Tailwind grid utility.
- **`aria-live="polite"` na count paragrafu** je na SSG overkill, ale nic neškodí a připraví půdu na budoucí filter UI (Sprint 004), kde se count bude měnit.
- **Dashboard Run 14 uzavřen**, tasks 60–63 všechny `done`.
