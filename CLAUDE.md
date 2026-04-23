# Project rules

## pingupedia specifika

- **Žádný obrázek nesmí být ořezaný.** Nepoužívat `object-cover` ani `background-image` s croppingem. Vždy celý obrázek viditelný — `aspect-ratio` kontejner + `object-contain`, nebo intrinsic dimensions.
- **Obsah jen z ověřených zdrojů** — Wikipedia, IUCN Red List, BirdLife, vědecké publikace. Každý druh má povinné pole `sources`. Faktické tvrzení bez zdroje sem nepatří.
- **Cílovka:** děti i dospělí, tón populárně-naučný, ale nezlehčující.
- Detaily viz `docs/PROJECT.md`.

## MCP docs — mandatory

NEVER write framework code from memory. Before writing ANY code that uses Effect TS, Svelte 5, Astro 6, Tailwind CSS, shadcn-svelte, daisyUI 5, Hono, Drizzle, Expo, better-auth, bits-ui, tiptap, or Cloudflare Workers APIs, you MUST search MCP docs first:

- `mcp__plugin_kafe-stack_context7__query-docs` — **preferred**: current docs from source repos. Use after resolving library ID via `resolve-library-id` or from `.claude/context7-libs.md`.
- `mcp__worker-mcp__ask_docs` — AI-powered answer with citations (~300 tokens). Use for "how do I…" questions.
- `mcp__worker-mcp__search_docs` — raw doc search. Use `max_results=3` and `snippet_length=200` to save tokens.
- `mcp__cloudflare-api__search` — Cloudflare OpenAPI spec
- `mcp__cloudflare-api__execute` — Cloudflare API access

**MCP search strategy (pick the cheapest that works):**
1. `context7 query-docs` (~200-500 tokens) — current docs from source repo, code snippets
2. `ask_docs` (~300 tokens) — "how does X work?" → AI answer with code + citations
3. `search_docs(max_results=3, snippet_length=200)` (~500 tokens) — verify a pattern exists
4. `get_doc_page` — only when you need full page content

Use simple 1-2 word search terms. One search per **framework sub-category** (effect-layer, effect-schema, svelte-state, svelte-lifecycle, hono, drizzle, shadcn, tailwind, cloudflare…). Generic "effect" or "svelte" searches are NOT enough — search for the specific API you're using. If you "just know" the API — verify anyway, your training data is outdated.

**Context7 requirement:** When using 2+ framework categories, at least one search MUST be `context7 query-docs` (returns actual code examples). `search_docs` alone returns only titles — not enough for correct API usage.

Pre-resolved library IDs for context7: check `.claude/context7-libs.md` first. If missing, run `/context7-init` to generate from package.json.

## Tech stack

- **Astro 6** with `@astrojs/cloudflare` adapter (Workers, not Pages)
- **Svelte 5** — runes only ($state, $derived, $effect, $props). No Svelte 4 patterns.
- **Effect TS** — generators, TaggedError, Context.Tag, Layers. No async/await, no throw.
- **Cloudflare Workers** — D1, R2, KV, Vectorize, Workers AI
- **daisyUI 5** + Tailwind CSS 4
- **Bindings** via `import { env } from 'cloudflare:workers'`, not `Astro.locals.runtime`

## Forbidden patterns

- `as any`, `@ts-ignore`, `@ts-nocheck`
- `throw` in Effect code — use `Data.TaggedError`
- `async/await` in Effect code — use `Effect.gen` + `yield*`
- `export let` in Svelte — use `$props()`
- `on:click` in Svelte — use `onclick`
- `$:` reactive declarations — use `$derived`
- `createEventDispatcher` — use callback props
- `Astro.locals.runtime` — use `cloudflare:workers`
- Content collections without `loader`

## Workflow

- Use `/work` for structured sprint work (plan → execute → review → handoff)
- Use `/review` before every commit
- Use `/checkmcp` to audit MCP coverage or search docs quickly
- Use `/handoff` to document sprint and prepare next one
- Use `/tests` to generate tests via test-writer agent
- Commit only after /review passes with no PROBLEMs
- Never add Co-Authored-By or AI signatures to commits

## Communication

- Czech with the user
- English in code, commit messages, file names

## Commands

| Command | What it does | Co to dělá |
|---------|-------------|------------|
| `/start` | Bootstrap new project from kostra template | Nový projekt z šablony kostra |
| `/init` | Create PROJECT.md, register in dashboard, first sprint | Inicializace projektu a dashboardu |
| `/work` | Structured sprint — plan, execute, review, handoff | Strukturovaný sprint s review a handoffem |
| `/review` | Deep self-review before commit — reads full files, traces logic | Self-review před commitem, čtení celých souborů |
| `/audit` | Pre-PR audit — all changes since diverging from main | Hluboký audit před PR/push |
| `/full-audit` | Sequential file-by-file audit of entire codebase | Kompletní audit celého projektu |
| `/lint` | Run all checks — typecheck, astro check, svelte-check, eslint, tests | Všechny code quality checky najednou |
| `/fix` | Fetch open bugs from dashboard and fix them | Stažení a oprava bugů z dashboardu |
| `/deploy` | Commit, push, verify GitHub → CF Workers deploy | Commit, push, ověření deploye |
| `/checkmcp` | Audit MCP usage or search docs (`/checkmcp effect Layer`) | Audit MCP použití nebo rychlé hledání v docs |
| `/handoff` | Document finished sprint, create next sprint | Dokumentace sprintu + vytvoření dalšího |
| `/tests` | Generate tests for changed or specified files | Generování testů pro změněné soubory |
| `/status` | Quick project status — bugs, sprint, phase | Rychlý přehled stavu projektu |

