# Run 013e: Hry rozcestník + kvíz jako content collections

**Status:** IN-PROGRESS
**Date:** 2026-04-24
**Sprint:** 003-admin
**Dashboard Run:** 171

<!-- dashboard-tasks: {"Hry a kviz jako content collections": 778, "Refaktor stranek Hry a Kviz": 779, "Admin form pro Hry rozcestnik": 780, "Admin editor pro kvizove otazky": 781, "Verifikace build a deploy": 782} -->

## Kontext

Run 013e dokončuje pattern přesun hardcoded textů do content collections — stránka `/hry/` (4 herní karty) a `/hry/kviz/` (5 kvízových otázek z `src/lib/games/quiz-data.ts`). Hry dostanou strukturovaný form. Pro kvíz používám JSON textarea editor jako jednodušší MVP — strukturovaný form s radio buttons pro `correct` index přidá Run 013f spolu s species gallery/sources.

## Zadání

- [ ] `src/content/pages/hry.json` + `src/content/quiz.json` + `hry`/`quiz` collections + helpery
- [ ] Refaktor `src/pages/hry/index.astro` + `src/pages/hry/kviz.astro`, smazat `src/lib/games/quiz-data.ts`
- [ ] `/admin/texty/hry/` strukturovaný form + client
- [ ] `/admin/texty/kviz/` JSON textarea editor + validace před PUT
- [ ] `/admin/texty/` index (hry + kviz → ready) + check + build + deploy

## Řešení

(doplní se během runu)

## Poznámky

(doplní se během runu)
