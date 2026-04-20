# Run 007a: Lightbox + pilot galerie (cisarsky)

**Status:** done
**Date:** 2026-04-20
**Sprint:** 002-species
**Dashboard Run:** 21

<!-- dashboard-tasks: {"Načíst MCP docs pro Astro 6 client scripts + dialog a11y": 88, "Vytvořit SpeciesGallery.astro + lib/lightbox.ts (native dialog, keyboard nav, no-crop)": 89, "Integrovat SpeciesGallery do druhy/[slug].astro": 90, "Pilot: 2-3 gallery fotky k cisarsky + CREDITS": 91, "Build + astro check + a11y verify": 92} -->

## Kontext

Sprint 002 má seed 17/17 druhů hotový. Run 007 z PLAN.md má velký záběr (lightbox + seed galerií ke všem druhům). Rozděluje se stejně jako 006:

- **007a (tato session)** — lightbox infrastruktura + pilot na jednom druhu (cisarsky)
- 007b+ (další sessions) — postupný seed galerií pro ostatní druhy po batchích

Svelte se podle PROJECT.md přidává až ve Sprintu 003, takže pro lightbox **vanilla JS + native `<dialog>`** — jednodušší, accessibility zadarmo, žádný nový dependency.

## Zadání

- [x] Načíst MCP docs pro Astro 6 client-side `<script>` + native `<dialog>` a11y pattern (keyboard, focus trap)
- [x] Vytvořit `src/components/species/SpeciesGallery.astro` + `src/lib/lightbox.ts` — native `<dialog>` lightbox s keyboard nav (ESC/←/→), no-crop pravidlem, responzivní
- [x] Integrovat `SpeciesGallery` do `src/pages/druhy/[slug].astro` (nahradit inline gallery grid)
- [x] Pilot: přidat 2-3 gallery fotky k druhu `cisarsky` (WebFetch Commons) + CREDITS záznamy
- [x] Build + astro check + a11y verify (ESC zavře, Tab loop, prev/next šipky)

## Design rozhodnutí

**Lightbox technologie:** native `<dialog>` HTML5 element — plně podporuje modal chování (inert background, ESC to close, focus trap via `showModal()`). Žádná JS knihovna, žádný Svelte komponent.

**Struktura komponentu:**
- `SpeciesGallery.astro` — renderuje grid thumbnailů + skryté `<dialog>` s lightbox obsahem. Každý thumbnail je `<button>` který otevírá dialog s konkrétním indexem.
- `lib/lightbox.ts` — client-side script: handlery pro button klik, keyboard nav (←/→ mezi obrázky, ESC), zobrazení caption. Inicializuje se per-gallery (může být víc galerií na stránce).

**No-crop invariant:** všechny obrázky (thumbnaily i fullsize v dialogu) používají `<NoCropImage>` nebo `.img-nocrop` utility. V dialogu `object-fit: contain` + max viewport.

**Responzivita:**
- Grid thumbnails: 1 col mobile → 2 col sm → 3 col lg (stávající struktura).
- Dialog fullscreen: image max-height 85vh, caption pod ním, kontrolky (prev/next/zavřít) na okrajích.

**Accessibility checklist:**
- `<dialog>` → native focus trap + `Esc` to close
- Každé `<button>` má `aria-label` s "Otevřít fotku N z M: {alt}"
- Prev/next `<button>` mají `aria-label` + disable když na hraně
- Close button se keyboard focusem → první po otevření
- `aria-live="polite"` region pro oznámení změny obrázku screen readerem

## Pilot druh: cisarsky

Hledat 2-3 kvalitní fotografie tučňáka císařského na Wikimedia Commons:
- Kolonie (zásnubní, kuřata, zimování)
- Zajímavé chování (potápění, prochází ledem)
- Licence CC-BY nebo public domain

Cíl: ověřit že galerie zobrazí 1 hero + 2-3 gallery fotky, lightbox funguje, CREDITS se správně generuje.
