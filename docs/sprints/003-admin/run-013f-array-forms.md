# Run 013f: Species gallery/sources dynamic forms + strukturovaný quiz editor

**Status:** TODO
**Date:** 2026-04-24
**Sprint:** 003-admin

## Kontext

Zbývají poslední dva komplexní kousky admin UI před Runem 014 (TipTap + R2):

1. **Species gallery + sources** — v `/admin/druhy/<slug>/` jsou aktuálně dva array-of-objects fieldy řešené textarea block parserem (stejný `---` separátor pattern jako `hry-form-client.ts`). Pro MVP funguje, ale UX je hrubý — uživatel musí kopírovat strukturu ručně. Přidat dynamic `+ Přidat fotku` / `+ Přidat zdroj` s řádky inputů a `×` smazat.
2. **Quiz strukturovaný form** — nahradit JSON textarea za 5 bloků otázek s radio buttons pro `correct` (index 0-3) a textovými inputy pro `question` / `options[4]` / `explanation`. `+ Přidat otázku` / `− Odstranit` tlačítka.

Oba sdílí pattern: client-side array state + render loop + add/remove handlers + serialize na submit.

## Zadání

- [ ] **Extract reusable `array-field.ts` helper** — `renderArrayField<T>({ container, items, render, serialize, defaults })`. Spravuje add/remove + re-render. Používaný oběma features.
- [ ] **Species form: gallery dynamic UI** — v `src/lib/admin/species-form-client.ts` nahradit textarea parser za container s řádky. Každý řádek: `image` (readonly z `/uploads/`), `caption`, `credit`, `×`. Přidat `+ Přidat fotku`.
- [ ] **Species form: sources dynamic UI** — stejný pattern pro `sources[]`: `title`, `url`, `×`. `+ Přidat zdroj`.
- [ ] **Quiz strukturovaný form** — přepsat `kviz-form-client.ts` + `kviz.astro`: 5 bloků otázek s radio buttons. Zachovat `validateQuiz()` stejnou (chrání proti shape chybám), ale form je nativně typed.
- [ ] **Quiz: duplicitní slug check** — pro hry form, detekce a error zpráva "Duplicitní slug: X v kartách #2 a #4".
- [ ] **Check + build + deploy** — typecheck + astro check + svelte-check musí být 0/0/0.

## Technické poznámky

- `renderArrayField` bude vanilla TS modul (žádný framework, zbytek adminu je taky vanilla).
- Gallery řádky potřebují `src` preview miniatura → 64×64 `<img>` pro orientaci. Není to kritické pro MVP, ale radikálně zlepší UX.
- Quiz radio buttons: `name="correct-{i}"` unikátní per otázka, `value="0-3"`, checked na `correct === i`.
- Serialize: čtení hodnot z DOM při submit (neduplikovat do JS state, jde o jednorázový flush).

## Závislosti

- Vyžaduje: Run 013a-e (stabilní content collection pattern + admin infrastruktura)
- Blokuje: Run 014 (TipTap) — ale není kritická, Run 014 je nezávislý feature set

## Rizika

- **Gallery: referenční integrita** — pokud uživatel smaže fotku z arraye ale nechá soubor v `/public/uploads/`, bude orphan. Pro MVP je to fine (soubor zůstane, prostě nerenderuje). Cleanup přijde s Runem 014 (R2 binding).
- **Quiz: migrace seed dat** — stávající JSON zůstává jako source of truth, form jen refresh UI. Nevytvářet další loader.
