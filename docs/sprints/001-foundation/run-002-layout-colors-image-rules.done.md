# Run 002: Layout, barevné schéma, obrázková pravidla

**Status:** DONE
**Date:** 2026-04-19
**Sprint:** 001-foundation
**Dashboard Run:** 12
**Session:** Druhý run projektu — pingupedia vizuální identita a obrázková pravidla.

<!-- dashboard-tasks: {"Pingupedia paleta + .img-nocrop utility v global.css": 50, "Komponenta NoCropImage.astro (mcp)": 51, "Testovaci fotka tucnaka z Wikimedia + pouziti na homepage": 52, "Aktualizovat PROJECT.md — vizualni pravidla": 53, "Build + typecheck + Playwright screenshot": 54} -->

## Kontext

Po Run 001 měl projekt pingupedia brand, ale vizuálně pořád generickou modrou z kostra šablony. Tento run nasadil ledovo-mořskou paletu (sky/teal, tematicky blízkou prostředí tučňáků), vytvořil `<NoCropImage>` komponentu a utility `.img-nocrop` pro vynucení klíčového projektového pravidla (žádné ořezané obrázky), a nasadil první testovací fotografii na homepage s řádnou atribucí.

## Zadání

- [x] Pingupedia barevná paleta (ledová/mořská) — :root + light mode v global.css
- [x] `<NoCropImage>` komponenta s aspect-ratio wrapperem + astro:assets Image
- [x] Utility `.img-nocrop` v global.css
- [x] Dekorativní fotka tučňáka (Wikimedia Commons CC-BY)
- [x] Aktualizovat PROJECT.md — vizuální pravidla + příklady
- [x] Build + typecheck + Playwright screenshot

## Řešení

- **Paleta** (`src/styles/global.css:17-43`) — sky + teal tokeny. Dark mode: background `#06111f` (polární noc), foreground `#f0f9ff` (sky-50), primary `#38bdf8`, primary-btn `#0ea5e9`, accent `#5eead4` (teal-300). Light mode: background `#f0f9ff`, foreground `#0c1929`, primary `#0284c7`, accent `#0891b2`. Kontrast WCAG AA pro velký text (primary-btn #0ea5e9 + #fff = 3.22 dark; #0284c7 + #fff = 5.17 light). Design tokens propojeny přes `@theme` blok s Tailwind 4, aby util classy `text-primary`, `bg-accent` fungovaly.
- **`.img-nocrop`** (`src/styles/global.css:95-100`) — `display: block; width: 100%; height: 100%; object-fit: contain;`. Používá se uvnitř aspect-ratio kontejneru, garantuje letterbox místo crop.
- **`<NoCropImage>`** (`src/components/media/NoCropImage.astro`, 34 řádků) — Props: `src: ImageMetadata`, `alt: string` (povinné), `ratio?: string` (default `"4/3"`), `class?`, `sizes?`, `loading?`. Wrapper div s inline `style="aspect-ratio: ${ratio};"` + scoped `.nocrop-wrapper { width: 100%; display: block; }`. Uvnitř `<Image>` z `astro:assets` s třídou `.img-nocrop`. Potvrzeno přes `node_modules/astro/components/Image.astro:1-53` (Astro 6 API, context7 kvóta vyčerpaná).
- **Fotka** (`src/assets/penguins/emperor-penguin-snow-hill.jpg`, 872×1400 px, 963 KB) — Ian Duffy, CC BY 2.0, Snow Hill Island (Antarktida), 2009-11-17. Stažena přes MediaWiki API s license metadata verification. Metadata zapsaná v `src/assets/penguins/CREDITS.md`.
- **Homepage** (`src/pages/index.astro`) — ESM import `emperorPenguin from "../assets/penguins/..."` + `<figure>` s `<NoCropImage ratio="872/1400" loading="eager">` + `<figcaption>` s autorem a licencí. `data-astro-prefetch="false"` na CTA na `/druhy/` a `/o-projektu/` (neexistují).
- **Prefetch fix** (`src/components/layout/Navbar.astro`, `Footer.astro`) — `data-astro-prefetch="false"` na všechny navLinks (viewport prefetch by fetchnoul neexistující cíle, což bylo viditelné v dev console). Atributy pak při vzniku stránek odstranit.
- **PROJECT.md** — sekce „Vizuální pravidla" rozšířena o příklady použití `<NoCropImage>` s kódem, odkaz na utility `.img-nocrop` a povinnost CREDITS.md pro každou fotku.
- **Verifikace** — `pnpm typecheck` + `pnpm build` prošly (0/0/0). Build wygeneroval WebP variantu fotky. Playwright full-page screenshot (`pingupedia-homepage-run002.png`) potvrdil: fotka celá viditelná, paleta ledová, figcaption s licencí, CTA tlačítka s pingupedia modrou.

## Poznámky

- **Context7 kvóta** je pořád vyčerpaná (obnova 1. 5. 2026). Ověření astro:assets proběhlo fallback přes `node_modules/astro/components/Image.astro` + `node_modules/astro/dist/assets/types.d.ts`.
- **`data-astro-prefetch="false"` je dočasný fix** — po vzniku `/druhy/` (Run 004) a `/o-projektu/` (Sprint 005) atributy odstranit, prefetch má smysl pro existující stránky.
- **`.glass` CSS** (`src/styles/global.css:67-76`) stále používá statické `rgba(255, 255, 255, …)` místo design tokens — ještě vizuálně funguje proti novému tmavě modrému pozadí, ale bylo by čistší refactorovat na `color-mix(in srgb, var(--foreground) N%, transparent)`. TODO pro Sprint 005 (polish).
- **Inline `style="aspect-ratio: ${ratio};"`** v NoCropImage — prop `ratio` je interní (vývojář), ne user input; žádný realistický attack surface. Alternativa `define:vars` + scoped style by byla čistší, ale ne kritická.
- **.gitignore** rozšířen o `.playwright-mcp/` a `*-run*.png`, aby Playwright artefakty nezasahovaly do commitů.
- **Komponenty `media/`** — nová doména v `src/components/` pro všechno okolo médií (obrázky, videa, galerie). Ve Sprint 002 přibude `GalleryGrid.astro` a možná lightbox.
