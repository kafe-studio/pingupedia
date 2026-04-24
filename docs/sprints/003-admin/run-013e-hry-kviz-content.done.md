# Run 013e: Hry rozcestník + kvíz jako content collections

**Status:** DONE
**Date:** 2026-04-24
**Sprint:** 003-admin
**Dashboard Run:** 171
**Commit:** 78aab6e

<!-- dashboard-tasks: {"Hry a kviz jako content collections": 778, "Refaktor stranek Hry a Kviz": 779, "Admin form pro Hry rozcestnik": 780, "Admin editor pro kvizove otazky": 781, "Verifikace build a deploy": 782} -->

## Kontext

Run 013e dokončuje pattern přesun hardcoded textů do content collections — stránka `/hry/` (4 herní karty) a `/hry/kviz/` (5 kvízových otázek z `src/lib/games/quiz-data.ts`). Hry dostanou strukturovaný form. Pro kvíz používám JSON textarea editor jako jednodušší MVP — strukturovaný form s radio buttons pro `correct` index přidá Run 013f spolu s species gallery/sources.

## Zadání

- [x] `src/content/pages/hry.json` + `src/content/quiz.json` + `hry`/`quiz` collections + helpery
- [x] Refaktor `src/pages/hry/index.astro` + `src/pages/hry/kviz.astro`, smazat `src/lib/games/quiz-data.ts`
- [x] `/admin/texty/hry/` strukturovaný form + client
- [x] `/admin/texty/kviz/` JSON textarea editor + validace před PUT
- [x] `/admin/texty/` index (hry + kviz → ready) + check + build + deploy

## Řešení

- **content.config.ts** — dvě nové kolekce se zod validací:
  - `hry`: `meta` + `hero` + `games[]` (slug regex, surface enum, emoji) + `cta`
  - `quiz`: `questions[]` (options length 4, correct int 0-3)
- **src/lib/pages.ts** — `getHryPage()` a `getQuiz()` helpery s `getEntry()` + throw fallback
- **src/pages/hry/index.astro** — `data.games.map()` místo hardcoded karet, `surfaceClass` enum → `bento-surface-*` mapping
- **src/pages/hry/kviz.astro** — `import { getQuiz }` místo `quiz-data.ts`
- **src/pages/admin/texty/hry.astro + hry-form-client.ts** — block parser `---` separátor + `key: value` per řádek (stejný pattern jako `home-form-client.ts`)
- **src/pages/admin/texty/kviz.astro + kviz-form-client.ts** — JSON textarea + `validateQuiz()` client-side shape kontrola

## Poznámky

- **Tracked WARNINGs pro Run 013f:**
  - `hry-form-client.ts:79-86` — chybí kontrola duplicitních slugů mezi kartami (zod to nezachytí, runtime render by dostal duplikát). Edge case, řešit s dynamic form UI v 013f.
  - `hry-form-client.ts:56` — parser line-split neumí multi-line hodnoty (např. description s `\n`). Zatím OK, dokumentováno v hint textu.
- **Quiz strukturovaný form** — současný JSON editor je funkční MVP, ale pro admin je to UX zátěž. Run 013f přidá radio button form s `+ Přidat otázku` / `− Smazat`.
- **Build 0/0/0** — typecheck + astro check + svelte-check čisté.
- **Smazaný soubor:** `src/lib/games/quiz-data.ts` (-59ř). Grep potvrdil, že nikdo nereferuje.
