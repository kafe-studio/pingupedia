# Run 012: Admin editace druhů

**Status:** TODO
**Date:** 2026-04-23
**Sprint:** 003-admin

## Kontext

Run 011 dodal GitHub API wrapper + diagnostiku. Tenhle run postaví první skutečnou edit funkci: list všech 18 druhů + formulář pro editaci jednoho druhu (frontmatter pole + body markdown jako textarea). Save = PUT přes GitHub API → commit na `main` → CF Workers Build deploy (nebo ruční wrangler deploy pokud auto-build stojí).

## Zadání

- [ ] `src/lib/admin/frontmatter.ts` — parse a serialize YAML frontmatteru + body (minimal custom parser, bez `js-yaml` deps); TS typy odpovídající schemě
- [ ] `src/pages/admin/druhy/index.astro` — list 18 druhů s link na edit (GitHub API `getFile` pro každý, nebo jen lokální `getCollection` a čtení frontmatter pole); `prerender = false`
- [ ] `src/pages/admin/druhy/[slug]/index.astro` — detail/edit form (textové inputy pro frontmatter + `<textarea>` pro body, submit na POST API)
- [ ] `src/pages/api/admin/species/[slug].ts` — GET (fetch latest from GitHub) + PUT (parse form → serialize → `putFile` + commit); sha handling pro concurrency
- [ ] Astro check + build + commit + deploy; po nastavení `GITHUB_TOKEN` smoke test na produkci

## Design

### Frontmatter parser

Bez `js-yaml` lib (bundle size). Vlastní ~150 řádků parser:
- Split `---\n...\n---\n\n<body>` → `{frontmatter, body}`
- Parse plain YAML (strings, numbers, arrays, nested objects) — náš schema je omezený, nepotřebuje anchors/refs
- Serialize zpět pořadí polí zachováno (pro minimal diffs)

Alternativa: držet raw markdown soubor, editovat celý text v jedné textarea. Jednodušší, ale uživatel edituje YAML ručně (risk typo → schema fail).

### Edit form

Fields per species (z `src/content.config.ts`):
- **Strings:** nameCs, nameLat, nameEn?, genus, description, habitat, population?, historicalNotes?
- **Enum:** iucnStatus (select LC/NT/VU/EN/CR/DD/EX)
- **Tuple [min, max]:** size.heightCm, size.weightKg (dva number inputy)
- **Array string:** distribution, diet (textarea, jeden řádek = jedna položka)
- **Number:** lifespan.wildYears, lifespan.captivityYears?
- **Object:** hero (src, alt, author, license, sourceUrl) — group inputů
- **Array object:** gallery? + sources — složitější, možná nechat body na Run 014 (TipTap)
- **Date:** updatedAt → auto-set na dnešek při save

### Concurrency

GET vrátí `content` + `sha`. Klient drží `sha` v hidden input. PUT posílá zpět. Pokud mezitím někdo jiný commit, GitHub vrátí 409 — UI ukáže "Obsah se mezitím změnil, refreshni".

## Soubory ke čtení

- `src/content.config.ts` — schema
- `src/content/species/cisarsky.md` — vzor pro parser test
- `src/lib/admin/github.ts` + `content-paths.ts` — wrapper

## Rizika

- Frontmatter parser je custom — risk že něco zapomenu (např. multiline strings, escape). Pokrytí je specifické pro pingupedia schema, ne obecný YAML.
- `gallery` a `sources` pole jsou composite objekty — form pro array objektů je hodně UI. Zvážit odložit na Run 014 nebo použít raw text field s JSON.

## Plán souborů

- `src/lib/admin/frontmatter.ts` ~150 řádků (max 200)
- `src/pages/admin/druhy/index.astro` ~80 řádků
- `src/pages/admin/druhy/[slug]/index.astro` ~180 řádků (max 200) — pokud větší, rozdělit form do `SpeciesEditForm` komponenty
- `src/pages/api/admin/species/[slug].ts` ~100 řádků
