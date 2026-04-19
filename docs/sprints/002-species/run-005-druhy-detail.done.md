# Run 005: `/druhy/[slug]` detail

**Status:** DONE
**Date:** 2026-04-19
**Sprint:** 002-species
**Dashboard Run:** 15

<!-- dashboard-tasks: {"IucnBadge.astro + refactor SpeciesCard (bp)": 64, "SpeciesHero + SpeciesFacts + SpeciesSources (bp)": 65, "/druhy/[slug].astro getStaticPaths + render + historie + galerie (mcp)(bp)": 66, "Typecheck + astro check + build verify": 67} -->

## Kontext

Run 004 postavil `/druhy` index s kartami druhů. Každá karta odkazuje na `/druhy/<slug>/`, ale detail zatím neexistuje — klik končí 404. Tento run dodá detail pro jeden druh (`cisarsky`) a připraví strukturu pro Run 006 (seed všech druhů). Datový model (`species` collection) obsahuje všechny pole — fakta, distribuce, dieta, lifespan, historické poznámky, zdroje, případnou galerii. Body markdown má populárně-naučný text.

## Zadání

- [x] `src/pages/druhy/[slug].astro` — dynamic route, `getStaticPaths` z `getCollection("species")`, `prerender = true` (mcp)
- [x] Hero sekce — velký `NoCropImage`, nameCs/nameLat, IUCN badge, krátký popis, atribuce fotky (autor + licence + odkaz)
- [x] Fakta panel — size (výška/váha), rod, habitat, distribuce, dieta, lifespan (wild/captivity), population (pokud je)
- [x] Markdown body render (`render(entry)`) — populárně-naučný text (mcp)(bp)
- [x] Historické poznámky sekce (pokud `historicalNotes`)
- [x] Zdroje — seznam s typem, titulkem, odkazem
- [x] Galerie (pokud `gallery`) — zatím jen grid `NoCropImage` bez lightboxu (lightbox je Run 007)
- [x] Typecheck + astro check + build verify

## Soubory ke čtení

- `src/content.config.ts` — aktuální species schema (všechny pole)
- `src/content/species/cisarsky.md` — struktura testovacího druhu (frontmatter + body)
- `src/components/species/SpeciesCard.astro` — IUCN badge styling pattern, labels/tone maps (k recyklaci do detailu)
- `src/components/media/NoCropImage.astro` — API pro hero v detailu
- `src/pages/druhy/index.astro` — konvence page struktury, metadata, reveal tříd
- `.astro/content.d.ts` — typy pro `getStaticPaths`/`render` (Astro 6 API, Context7 quota vyčerpaná do 1. 5.)

## Plán struktury

Detail stránka bude na hranici 200 řádků. Pokud roste přes limit, rozdělit:

- `src/components/species/SpeciesHero.astro` — hero sekce s atribucí
- `src/components/species/SpeciesFacts.astro` — fakta panel (size, rod, habitat, …)
- `src/components/species/SpeciesSources.astro` — seznam zdrojů s ikonkou podle typu
- `src/pages/druhy/[slug].astro` — orchestrace

IUCN badge je už v SpeciesCard. Buď extrahovat `IucnBadge.astro` (~30 řádků) s shared labels/tone, nebo prostě zkopírovat do SpeciesHero. Rozhodnutí na začátku runu — pokud je budeme potřebovat v Run 007 (galerie), extrahovat; jinak inline.

## Řešení

- **IucnBadge komponenta** (`src/components/species/IucnBadge.astro`, 47 řádků) — extrahovaná z SpeciesCard, `status` + `size` ("sm" default / "md") props, centralizované cs labels + tone maps, aria-label + title. SpeciesCard se refaktoroval na její použití (ze 67 na 43 řádků).
- **SpeciesHero** (`src/components/species/SpeciesHero.astro`, 57 řádků) — `IucnBadge size="md"` + volitelný `nameEn` štítek, `<h1>` s cs názvem, italic lat, `NoCropImage` ratio 16/10 s `rounded-2xl`, `figcaption` s atribucí (autor + licence + odkaz "Zdroj" s `rel="noopener"`), leading description pod hero.
- **SpeciesFacts** (`src/components/species/SpeciesFacts.astro`, 83 řádků) — sémantický `<dl>`/`<dt>`/`<dd>` grid 1/2/3 sloupců. `fmtRange` formátuje výšku/váhu (s „–" pro rozsah, jedna hodnota když min===max), `fmtYears` cs pluralizace (rok/roky/let). Distribuce + strava jako `<ul>` uvnitř `<dd>`. Population a captivityYears conditional.
- **SpeciesSources** (`src/components/species/SpeciesSources.astro`, 58 řádků) — vertikální seznam karet se `typeLabels` mapou (Wikipedia/IUCN/BirdLife/Věda/Muzeum/Jiné), `Intl.DateTimeFormat("cs-CZ")` pro `updatedAt` v cs formátu ("19. dubna 2026"), externí odkazy s `rel="noopener" target="_blank"`, optional `note` pod titulkem.
- **Detail stránka** (`src/pages/druhy/[slug].astro`, 101 řádků) — `prerender=true`, `getStaticPaths satisfies GetStaticPaths` z `getCollection("species")` mapou na `{ params: { slug: entry.id }, props: { entry } }`, `await render(entry)` → `<Content />` v `prose prose-invert prose-lg` kontejneru. Conditional sekce: historie, galerie (s grid `NoCropImage` + figcaption). Navigační "Zpět" link dole.
- **Verifikace** — `pnpm check`, `pnpm typecheck`, `pnpm build` — vše 0/0/0. Build prerenderoval `/druhy/cisarsky/index.html`.

## Poznámky

- **Extrakce IucnBadge** — investice se splatí v Run 007 galerii, Run 013 related species a Run 012 filter UI. Shared labels + tone maps drží pohromadě.
- **Astro API fallback** — Context7 quota pořád vyčerpaná (obnova 1. 5.). `getStaticPaths`, `render`, `RenderResult.Content`, `GetStaticPaths` typ ověřeny přes `.astro/content.d.ts:2-4,39-46,84-86`. Stejný fallback jako Run 003/004.
- **Review WARNINGy** (non-blocking):
  - `IucnBadge.astro:44` (původní) — sr-only span dead code kvůli aria-label. **Opraveno** v review.
  - `IucnBadge.astro:2` — `IucnStatus` type je lokální duplikát `src/content.config.ts:5`. Pokud se přidají `EW`/`NE` do schema (Run 003 TODO), aktualizovat tady.
  - `SpeciesFacts.astro:11-12` — `fmtRange` nechrání před `max < min`. Schema `rangeTuple` nemá `.refine(min ≤ max)` (Run 003 TODO). Riziko při Run 006 seed.
  - `[slug].astro:37` — `prose prose-invert` předpokládá dark mode. Při Sprint 005 theme toggle přepsat na `dark:prose-invert`.
- **`prose prose-invert prose-lg`** — `@tailwindcss/typography` plugin aktivní v `src/styles/global.css:2` (`@plugin "@tailwindcss/typography"`).
- **Dashboard Run 15**, tasks 64–67 všechny `done`.
