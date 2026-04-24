# Run 013c: Homepage texty jako content collection + admin form

**Status:** DONE
**Date:** 2026-04-24
**Sprint:** 003-admin

> Dashboard unavailable (FOREIGN KEY) — tracking jen lokálně.

## Kontext

Run 013b postavil infrastrukturu (content-paths, `/api/admin/texty/[id]`, `/admin/texty/` shell). Tento run využívá tu infrastrukturu pro editaci **homepage** textů. Image importy a species slugy v bento kartách zůstávají hardcoded v .astro (to je struktura stránky, ne editovatelný obsah). Admin edituje jen textové řetězce.

## Design

### Schema

Samostatná `home` content collection s glob pattern `home.json` a strict Zod schema pokrývající všechny textové sekce homepage. Pro budoucí stránky (o-projektu, hry) se přidají další kolekce stejným způsobem.

HTML v titlech (`<span>`, `<br>`) se ukládá jako raw string a renderuje přes `<Fragment set:html={...}>`. Admin může značky editovat; XSS risk je tolerován, protože admin je auth-gated.

### Sections

1. **hero** — eyebrow, titleHtml, subtitle (+ mascot pose fix)
2. **featured** (tučňák týdne) — badge, slug (readonly v form), titleHtml, description, imageAlt
3. **stats** — eyebrow + subtitle (hodnota se počítá z collection)
4. **catalogCta** — eyebrow, titleHtml, subtitle
5. **speciesCards** — array of {slug, genus, name, alt} (slug readonly)
6. **howSection** — eyebrow, titleHtml, items[] (4 bullet points)
7. **aboutCta** — eyebrow, titleHtml, description

## Zadání

- [x] `src/content/pages/home.json` + `home` collection + `src/lib/pages.ts::getHomePage()`
- [x] `src/pages/index.astro` refaktor na `await getHomePage()` + `<Fragment set:html>` + `import.meta.glob` pro hero images
- [x] `src/pages/admin/texty/home.astro` form se 7 sekcemi
- [x] `src/lib/admin/home-form-client.ts` hydrate + collect + PUT
- [x] Astro check + build 0/0/0 + `/admin/texty/` home → ready

## Risks

- **HTML in titles** → `set:html` bypassuje Astro auto-escape. Admin-only přístup mitiguje.
- **Image importy** — hardcoded v .astro. Když user bude chtít změnit featured species slug, musí edit .astro (nebo pozdější Run přidá dynamic `import.meta.glob`).
- **Breaking deploy** — build validates schema, takže broken JSON zabrání deploymentu (produkce stabilní).

## Řešení

- **`src/content/pages/home.json`** (52 ř) — 7 sekcí (hero, featured, stats, catalogCta, speciesCards[], howSection, aboutCta) strukturovaně. HTML v titlech (`<span>`, `<br />`) jako raw string.
- **`src/content.config.ts`** (+50 ř) — `home` kolekce s glob `home.json` a strict Zod schema. `slugRe = /^[a-z0-9-]+$/` reused pro `featured.slug` a `speciesCards[].slug`. Každý string má `min(1)`.
- **`src/lib/pages.ts`** (10 ř) — `getHomePage()` wrapper + typed `HomePage` alias, stejný pattern jako `lib/site.ts`.
- **`src/pages/index.astro`** (175 ř) — refaktor z hardcoded na `await getHomePage()`. HTML titles renderované přes `<Fragment set:html>` (3×), subtitle přes `<p set:html>` (kvůli `&nbsp;`). `import.meta.glob("../assets/penguins/*/hero.jpg", { eager: true, import: "default" }) as Record<string, ImageMetadata>` → lookup `heroBySlug(slug)` pro featured i species cards. `howSection.items.map` generuje bullet list.
- **`src/pages/admin/texty/home.astro`** (190 ř) — 8 sekcí (hero, featured, stats, catalogCta, speciesCards textarea, howSection, aboutCta, commit). Hint u HTML polí s příkladem. `featuredSlug` jako readonly (edit přes git). `speciesCards` jako textarea ve formátu `slug | Rod | Název | Alt` per řádek.
- **`src/lib/admin/home-form-client.ts`** (163 ř) — `mountHomeForm()`: async load + hydrate, submit → collect → PUT. `cardsToText`/`textToCards` parser s regex validací slugu, throw s user-friendly message. `collectForm(original)` zachovává readonly fields z původu.
- **`src/pages/admin/texty/index.astro`** — `page/home` entry přepnut z `soon` na `ready` + skutečný href.
- **Build fix:** původní `import.meta.glob<{ default: ImageMetadata }>(...)` build padal s „i is not defined" (generic parameter interferoval s Astro SSG codegen). Řešení: untyped volání + cast `as Record<string, ImageMetadata>` + `import: "default"` strip wrapping.

## Poznámky

- **Review WARNINGy (non-blocking):**
  - `home-form-client.ts:43` — `line.split("|")` selže při `|` v textu (nepravděpodobné v CZ encyklopedických textech).
  - `index.astro:25,119-139` — build-time throw pokud admin uloží slug bez hero image. Deploy blocked = produkce safe; mitigováno hintem v form.
- **HTML v titlech** — renderuje se přes `set:html` (XSS risk pokud by do adminu pronikl útočník; admin je auth-gated). Admin může značky editovat, což je záměr (lze měnit `<span class="text-accent">` pro zvýraznění slov).
- **Dashboard unavailable** — FOREIGN KEY chyba, tracking jen lokálně.
- **Next:** Run 013d — o-projektu extrakce. Identický pattern, jen jiný schema shape. Po 013d bude infrastruktura otestovaná na 3 stránkách — možný kandidát na extrakci helper `create-page-form()` pro příští stránky (hry, kvíz).
