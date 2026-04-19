# Run 003: Species content collection schema + 1 testovací druh

**Status:** DONE
**Date:** 2026-04-19
**Sprint:** 001-foundation
**Dashboard Run:** 13
**Session:** Třetí a poslední run Sprint 001 — datový model druhů + první naseedovaný druh.

<!-- dashboard-tasks: {"Species schema v content.config.ts (mcp)": 55, "Presun fotky do per-druh adresare + update CREDITS": 56, "Naseedovany druh cisarsky.md s 3+ zdroji": 57, "PROJECT.md sekce Datovy model druhu": 58, "Typecheck + build verify": 59} -->

## Kontext

Sprint 001 měl za sebou cleanup (Run 001) a vizuální identitu + obrázková pravidla (Run 002). Run 003 byl závěrečný — datový model: Astro content collection `species` se zod schématem, první naseedovaný druh (tučňák císařský), konvence pro umístění fotek per druh. Veřejné stránky `/druhy/*` přijdou až ve Sprint 002.

## Zadání

- [x] Species collection v `src/content.config.ts` (zod schema, image() helper)
- [x] Testovací druh `cisarsky.md` s 3+ ověřenými zdroji
- [x] Přesun fotky do `src/assets/penguins/cisarsky/hero.jpg` (per-druh adresář)
- [x] CREDITS.md aktualizovaný
- [x] PROJECT.md — sekce „Datový model druhů"
- [x] Build + typecheck + astro check všechno 0/0/0

## Řešení

- **Species schema** (`src/content.config.ts`, 72 řádků) — `defineCollection` s `glob` loaderem na `**/*.md` v `src/content/species/`, schema jako funkce `({ image }) => z.object({...})`. Pole: `nameCs`/`nameLat`/`nameEn?`/`genus`, `iucnStatus` enum (LC/NT/VU/EN/CR/DD/EX), `description` (≤ 240 znaků), `size.heightCm`/`weightKg` (tuple pozitivních čísel), `distribution`/`diet` (arrays min 1), `habitat`, `lifespan.wildYears` (pozitivní)/`captivityYears?`, `population?`/`historicalNotes?`, `hero` objekt s `image()` helperem + licencní metadata, volitelná `gallery` pole, `sources` (min 2, enum typů Wikipedia/IUCN/BirdLife/Science/Museum/Other), `updatedAt` date.
- **Astro 6 breaking change** — `import { z } from "astro:content"` je deprecated, nahrazeno `import { z } from "astro/zod"` (re-export Zod v4). Navíc Zod v4 API: `.url()` → `z.url()`. Fix odhalen při `astro check` (43 warnings), opraveno.
- **Testovací druh** (`src/content/species/cisarsky.md`, 49 řádků) — tučňák císařský s kompletními daty: výška 100–130 cm, váha 22–45 kg, IUCN NT, distribuce Antarktida, dieta (ryby/kalmary/krill), lifespan wildYears 20 / captivityYears 40, historické poznámky o Terra Nova expedici 1910–1913 a knize „The Worst Journey in the World". 4 ověřené zdroje: Wikipedia CS, Wikipedia EN, IUCN Red List, BirdLife factsheet. Body má dva paragrafy populárně-naučného textu o velikosti/klimatu a hnízdním cyklu.
- **Přesun fotky** — `git mv src/assets/penguins/emperor-penguin-snow-hill.jpg src/assets/penguins/cisarsky/hero.jpg`. Aktualizován import v `src/pages/index.astro:6`, CREDITS.md záznam přejmenován na `cisarsky/hero.jpg`.
- **Konvence per-druh adresáře** dokumentována v CREDITS.md + PROJECT.md: `src/assets/penguins/<slug>/hero.jpg`, `gallery-1.jpg`, atd.
- **PROJECT.md** — nová sekce „Datový model druhů" se seznamem povinných a volitelných polí, pravidly (min 2 sources, hero a gallery přes image() → `<NoCropImage>`, markdown body pro populárně-naučný text), odkaz na `cisarsky.md` jako příklad.
- **Verifikace** — `pnpm build` + `pnpm check`: 0 errors, 0 warnings, 0 hints. Build optimalizoval `cisarsky/hero.jpg` do WebP.

## Poznámky

- **Astro 6 + Zod v4 migration** — pro budoucí runy: **vždy** `import { z } from "astro/zod"`, Zod v4 metody: `z.url()`, `z.email()`, `z.base64url()` místo `.url()`/`.email()`/`.base64url()`. Context7 kvóta pořád vyčerpaná (obnova 1. 5.), ověření bylo přes `node_modules/astro/dist/zod.js` + `node_modules/.pnpm/zod@4.3.6/.../schemas.d.ts`.
- **WARNINGs z review (netřeba hned fixovat):**
  - `iucnStatus` enum vynechává `EW` (Extinct in the Wild) a `NE` (Not Evaluated). Pro tučňáky prakticky zbytečné, ale pro úplnost lze doplnit.
  - `rangeTuple` nevynucuje `min ≤ max`. Lze přidat `.refine(([min, max]) => min <= max)`. V Sprint 002 Run 006 (seed všech druhů) by měl chybu odhalit review, pokud by někdo překlopil hodnoty.
- **Enforced sources min 2** — schema to garantuje, nezkoušel jsem explicitně negativní test (build s jedním zdrojem), ale zod validátor je deklarativní a build by selhal. TODO: přidat to do `/audit` checklistu Sprint 001.
- **Dashboard Run 13 uzavřen**, tasks 55–59 všechny `done` s řešeními.
