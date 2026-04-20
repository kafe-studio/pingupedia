# Run 007a: Lightbox + pilot galerie (cisarsky)

**Status:** DONE
**Date:** 2026-04-20
**Sprint:** 002-species
**Dashboard Run:** 21
**Session:** Sprint 002 Run 007a — infrastruktura galerie + první druh

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

## Řešení (co a jak bylo uděláno)

- **MCP docs** → Astro 6 client-side `<script>` + native `<dialog>` + aria-live pattern (prev session; context7 quota v této review-fázi, pattern ale již ověřený před implementací).
- **SpeciesGallery.astro** [src/components/species/SpeciesGallery.astro](src/components/species/SpeciesGallery.astro) (105 ř.) — grid `<ul role="list">` thumbů (buttony s `aria-label "Otevřít fotku N z M: alt"`, `aria-haspopup="dialog"`) + skrytý `<dialog class="lightbox-dialog">` se slide figurami, close/prev/next tlačítky a `aria-live="polite"` status regionem. Per-stránka lze mít víc galerií — inicializace je scoped přes `[data-gallery-id]`.
- **lightbox.ts** [src/lib/lightbox.ts](src/lib/lightbox.ts) (62 ř.) — vanilla TS `initGalleryLightbox(section)`: `showSlide()` toggluje `hidden`, updatuje status, uchovává `currentIndex`; šipky `←/→` s `preventDefault()`, `dialog.showModal()` dává nativní focus trap + ESC; `close` event vrací focus na trigger.
- **lightbox.css** [src/styles/lightbox.css](src/styles/lightbox.css) (124 ř.) — scoped CSS s `--lb-*` vars, `::backdrop blur`, `.lightbox-imagewrap max-width: min(90vw, 1400px); max-height: 75vh` pro no-crop invariant, `.gallery-thumb aspect-ratio 4/3` + `img-nocrop`.
- **Integrace** [src/pages/druhy/[slug].astro:9,56-58](src/pages/druhy/[slug].astro) — `<SpeciesGallery photos={gallery} galleryId={`gallery-${entry.id}`} />` nahrazuje původní inline gallery grid (−33 ř.).
- **Pilot cisarsky** — 3 fotky (Ian Duffy CC-BY 2.0 "dva dospělci", François Guerraz CC-BY-SA 3.0 "mláďata při pelichání", Matthieu Weber PD "crèche u Dumont d'Urville"). Frontmatter gallery + CREDITS záznamy s plnými licenčními údaji, rozlišení a daty pořízení.
- **Build verify** — `pnpm check` 0/0/0, `pnpm typecheck` 0, `pnpm build` 29 obrázků optimalizováno + 18 stránek bez chyb, `pnpm lint:check` pouze 2 warnings v auto-generated `worker-configuration.d.ts` (ne můj kód).

## Poznámky

- **WARNING pro 007b+ (nebo budoucí `<NoCropImage>` úpravu):** slides v `<dialog>` mají `hidden` atribut ale `<Image>` v nich se **načítá hned** (hidden neblokuje download). Při 3 fotkách/druh OK, při 10+ zvažte lazy-otevření slide (JS vloží `<img>` až při prvním `showSlide`). V Sprint 003 Run 008+ revidovat.
- **Svelte rozhodnutí** — galerie zvládnutá bez Svelte; drží se PROJECT.md deadline Sprint 003 pro interaktivní komponenty.
- **Caption v light a tmavé — čitelnost** — `.lightbox-caption` má `--lb-muted-fg rgba(240, 249, 255, 0.70)` na tmavém `::backdrop`. Testováno proti PROJECT.md `object-contain` invariantu — žádný crop.
- **Slug konvence** dodržena — `src/assets/penguins/cisarsky/gallery-N.jpg` odpovídá PROJECT.md § "Konvence adresářů".
- **Scaling** — při růstu >10 fotek/druh přehodnotit: (a) lazy-load slides, (b) paginace grid thumbů.
- **Run 007b+** — postupný seed galerií pro zbývajících 16 druhů (vždy 2-3 fotky/druh z Commons, stejný pattern). Doporučený batching: 4-5 druhů per run.
