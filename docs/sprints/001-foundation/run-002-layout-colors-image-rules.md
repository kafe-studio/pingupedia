# Run 002: Layout, barevné schéma, obrázková pravidla

**Status:** IN_PROGRESS
**Date:** 2026-04-19
**Sprint:** 001-foundation
**Dashboard Run:** 12

<!-- dashboard-tasks: {"Pingupedia paleta + .img-nocrop utility v global.css": 50, "Komponenta NoCropImage.astro (mcp)": 51, "Testovaci fotka tucnaka z Wikimedia + pouziti na homepage": 52, "Aktualizovat PROJECT.md — vizualni pravidla": 53, "Build + typecheck + Playwright screenshot": 54} -->

## Kontext

Po Run 001 má projekt pingupedia brand (siteConfig, homepage, 404) a je zbaven kostra artefaktů (blog, RSS, kostra docs). Současný barevný systém v `src/styles/global.css` drží generickou modrou `#3b82f6` z kostra šablony. Tento run zavede **pingupedia vizuální identitu** (ledová/mořská paleta vhodná pro obsah o tučňácích) a **obrázková pravidla** — klíčové projektové pravidlo, které vylučuje jakýkoli crop (`object-cover`, `background-image` s cropem).

Cíl: každý obrázek na webu bude celý viditelný. Utility třída `.img-nocrop` nebo Astro komponenta `<NoCropImage>` zabalí `<Image>` do aspect-ratio kontejneru s `object-contain` a garantuje, že obrázek není ořezaný, ať je poměr jakýkoli.

## Zadání

- [ ] Navrhnout pingupedia barevnou paletu — ledová/mořská (primary + accent + background + foreground + typography contrast). Upravit `:root` a `:root[data-theme="light"]` v `src/styles/global.css`. Držet se design tokens přes `@theme` blok, aby Tailwind util classes fungovaly (`text-primary`, `bg-accent` atd.).
- [ ] Vytvořit Astro komponentu pro obrázky bez ořezu — `src/components/media/NoCropImage.astro`. Props: `src`, `alt`, `ratio` (např. `"16/9"`, `"4/3"`, `"1/1"`; default `"4/3"`), `class?`. Implementace: `aspect-ratio` wrapper + `<Image>` z `astro:assets` s `object-fit: contain`. (mcp — Astro 6: astro:assets Image component)
- [ ] Přidat globální utility `.img-nocrop` do `global.css` — `object-fit: contain; width: 100%; height: 100%; display: block;` — jako fallback pro `<img>` tagy mimo Astro komponentu.
- [ ] Aktualizovat homepage hero — přidat dekorativní fotku tučňáka (Wikimedia Commons CC-BY nebo public domain) použitím `<NoCropImage>`. Zdroj a licenci zapsat do komentáře `frontmatter` + poznámka pro Sprint 005 (credits page).
- [ ] Aktualizovat dokumentaci — `docs/PROJECT.md` sekce "Vizuální pravidla" odkázat na `.img-nocrop` / `NoCropImage` jako oficiální způsob. Přidat krátký příklad použití.
- [ ] Ověřit: `pnpm typecheck` + `pnpm build` bez chyb. Vizuálně zkontrolovat homepage v dev serveru (Playwright MCP — screenshot).

## Soubory ke čtení

- `src/styles/global.css` — současná barevná paleta + btn-primary/outline komponenty (nutno upravit nebo naladit)
- `src/layouts/BaseLayout.astro` — spotřebitel barev přes Tailwind util classes
- `src/pages/index.astro` — kam umístit testovací `<NoCropImage>`
- `src/components/` — kam vytvořit `media/NoCropImage.astro`
- `astro.config.mjs` — konfigurace `<Image>` (image service)

## Kritéria hotového

- Barevné tokeny reflektují pingupedia brand (ne generickou kostra modrou)
- `<NoCropImage>` komponenta existuje, používá `astro:assets` Image, aspect-ratio + object-contain
- Homepage má alespoň jeden testovací obrázek přes `<NoCropImage>` s citovanou licencí
- `pnpm build` + `pnpm typecheck` projdou bez chyb
- Vizuální screenshot homepage v dev serveru (Playwright MCP) — obrázek vidět celý, žádný crop
