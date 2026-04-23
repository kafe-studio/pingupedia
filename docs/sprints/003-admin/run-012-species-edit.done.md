# Run 012: Admin editace druhů

**Status:** DONE
**Date:** 2026-04-23
**Sprint:** 003-admin
**Dashboard Run:** 28

<!-- dashboard-tasks: {"admin/druhy/ list s thumbnails (bp)": 124, "admin/druhy/[slug]/ raw editor + client (bp)": 125, "api/admin/species/[slug] GET + PUT": 126, "Astro check + build + commit + deploy": 127} -->

**Scope revize (vs původní plán):** Run 012 dodá **raw markdown editor** (jedna textarea s celým souborem). Vlastní frontmatter parser + strukturovaný form s inputy per pole jsou odložené na Run 013 — risk komplexního UI pro array objektů (gallery, sources) na jednu session.

## Kontext

Run 011 dodal GitHub API wrapper + diagnostiku. Tenhle run postaví první skutečnou edit funkci: list všech 18 druhů + formulář pro editaci jednoho druhu (frontmatter pole + body markdown jako textarea). Save = PUT přes GitHub API → commit na `main` → CF Workers Build deploy (nebo ruční wrangler deploy pokud auto-build stojí).

## Zadání (revidované — raw markdown MVP)

- [x] `src/pages/admin/druhy/index.astro` — list 18 druhů s thumbnails (lokální `getCollection`, `astro:assets` Image, `object-contain` pro no-crop)
- [x] `src/pages/admin/druhy/[slug].astro` — raw markdown editor: textarea + commit message + save button, drobečková nav zpět
- [x] `src/lib/admin/species-edit-client.ts` — client-side load + save handler, sha concurrency refresh po úspěchu
- [x] `src/pages/api/admin/species/[slug].ts` — GET (fetch z GitHub se sha) + PUT (validace + commit), 409 handling pro conflict
- [x] Astro check + build 0/0/0 (69 files) + commit + deploy

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

## Řešení

- **List** (`src/pages/admin/druhy/index.astro`, 74 ř) — `prerender = false`, `getCollection("species")` + cs-locale sort, responzivní grid 1/2/3 sloupce. Thumbnail 80×80 přes `astro:assets` Image s `object-contain` + `bg-muted` (respektuje no-crop pravidlo z CLAUDE.md). IUCN badge + genus chip per karta. `{count} druhů` v hlavičce.
- **Edit stránka** (`src/pages/admin/druhy/[slug].astro`, 84 ř) — slug validace v frontmatteru (`/^[a-z0-9-]+$/`), drobečková nav, loading/error/form states, `<textarea>` min 500 px monospace, commit message s prefixem `Edit {slug}: `, cancel + save buttons, success box s linkem na commit.
- **Client** (`src/lib/admin/species-edit-client.ts`, 106 ř) — `mountSpeciesEditor()`: `loadFile(slug)` fetch GET, hydrate textarea + hidden sha input; `saveFile(event)` PUT s FormData, disable btn během requestu, na úspěch aktualizuje sha (umožňuje pokračovat v editaci). Error cesta skryje form, zobrazí červený box.
- **API** (`src/pages/api/admin/species/[slug].ts`, 107 ř) — GET (slug validate → `getClient()` → `github.getFile` → 200 nebo 404/502) a PUT (form parsing + validace content/sha/message + 200 kB limit → `putFile` s sha → 409 conflict message / 502 upstream / 200 success). Slug regex `^[a-z0-9-]+$` v obou metodách.
- **Verifikace** — astro check 0/0/0 (69 files), build prerenderuje všech 18 druhů + SSR admin routes včetně nových.
- **Review fix** — `admin/druhy/index.astro:47` původně `object-cover` (porušení no-crop pravidla) → opraveno na `object-contain`.

## Poznámky

- **Scope revize** vs původní plán: frontmatter parser + strukturovaný form odložen na Run 013. Dneska je raw markdown textarea, která pokrývá 100 % editace (uživatel vidí celý soubor). Kompromis na UX — YAML typo → build selže → produkce chráněná (deploy nepojde), git historie umožňuje revert.
- **Review WARNINGy**:
  - `api/admin/species/[slug].ts:73` — whitespace-only content projde; CF build pak selže na schema validation. Akceptovatelné (chráněný deploy).
  - Auth: chybí role check — single-user admin, akceptovatelné.
- **Next run (013)** — strukturovaný form: parser frontmatteru (`yaml` lib nebo minimal custom), inputy per pole, array manipulátory pro gallery/sources. Plus `/admin/texty/` flat key-value pro hardcoded stringy.
- **Dashboard Run 28**, tasks 124–127 všechny `done`.
