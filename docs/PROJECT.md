# pingupedia

## Záměr

Populárně-naučná encyklopedie všech druhů tučňáků v češtině. Cílovka: **děti i dospělí**, tón přístupný a zábavný, ale věcný. Důraz na bohatý vizuální obsah — fotografie, grafiky, mapy výskytu, historické souvislosti.

Nezávislý projekt (nesouvisí s Pinguworld).

## Obsahová pravidla

- **Pouze ověřené zdroje** — Wikipedia, IUCN Red List, BirdLife International, vědecké publikace, muzejní databáze. Každý druh má povinné pole `sources` (pole URL + název + typ).
- **Každé faktické tvrzení citovatelné** — pokud to nejde ověřit, nepatří to sem.
- **Všechny druhy tučňáků** (~18, podle aktuální taxonomie).
- Texty psané populárně-naučně, srozumitelné pro děti, ale bez podcenění čtenáře.
- Historické souvislosti — objevování, expedice, vztah k lidem.

## Vizuální pravidla

- **Žádný obrázek nesmí být ořezaný.** Žádné `object-cover`, žádný `background-image` crop. Vždy celý obrázek viditelný (aspect-ratio + `object-contain` nebo intrinsic dimensions).
- Mnoho fotek, grafik, map — bohatá vizuální encyklopedie.
- Fotografie z Wikimedia Commons (CC-BY / public domain) + dalších ověřených zdrojů s jasnou licencí.
- Licence každé fotky viditelně uvedena (autor, licence, odkaz).

### Jak implementovat no-crop

Pro Astro asset import (ESM, Image optimization):

```astro
---
import NoCropImage from "../components/media/NoCropImage.astro";
import penguin from "../assets/penguins/emperor-penguin.jpg";
---
<NoCropImage src={penguin} alt="Tučňák císařský" ratio="4/3" />
```

Props: `src` (ImageMetadata), `alt` (povinné), `ratio` (default `"4/3"`), `class?`, `sizes?`, `loading?`.

Pro `<img>` tagy mimo Astro komponentu nebo pro embedy:

```html
<div style="aspect-ratio: 4/3;">
  <img src="..." alt="..." class="img-nocrop" />
</div>
```

Utility `.img-nocrop` je definovaná v `src/styles/global.css` a aplikuje `object-fit: contain; width: 100%; height: 100%; display: block;`.

### Fotky a licence

Každá fotka tučňáka musí mít záznam v `src/assets/penguins/CREDITS.md` (autor, licence, zdrojový URL, místo, datum). Sprint 005 tento soubor promítne do veřejné credits stránky.

**Konvence adresářů:** `src/assets/penguins/<slug>/hero.jpg` pro hero fotku druhu, `gallery-1.jpg`, `gallery-2.jpg`… pro galerii. Slug odpovídá názvu souboru druhu v `src/content/species/` (např. `cisarsky`).

## Datový model druhů

Druhy jsou spravované přes Astro content collection `species` definovanou v [src/content.config.ts](src/content.config.ts). Každý druh je jeden markdown soubor v `src/content/species/<slug>.md` s frontmatterem validovaným přes zod schema a volitelným markdown body pro rozšířený popis.

### Povinná pole

- `nameCs`, `nameLat`, `genus` — česky, latinsky, rod
- `iucnStatus` — enum: `LC` | `NT` | `VU` | `EN` | `CR` | `DD` | `EX`
- `description` — krátký popis (≤ 240 znaků)
- `size.heightCm`, `size.weightKg` — pole `[min, max]`
- `distribution` — pole geografických oblastí
- `habitat`, `diet`, `lifespan.wildYears`
- `hero` — objekt s `src` (image asset), `alt`, `author`, `license`, `sourceUrl`
- `sources` — minimálně **2** ověřené zdroje, každý s `url`, `title`, `type` (`Wikipedia` | `IUCN` | `BirdLife` | `Science` | `Museum` | `Other`)
- `updatedAt` — datum poslední aktualizace

### Volitelná pole

- `nameEn`, `population`, `historicalNotes`
- `lifespan.captivityYears`
- `gallery` — pole objektů stejné struktury jako `hero`

### Pravidla

1. **Minimum 2 zdroje** — validator selže, pokud jich je méně. Každé faktické tvrzení v textu má oporu v nějakém z uvedených zdrojů.
2. **Hero a gallery obrázky** používají Astro `image()` helper → ImageMetadata → přes `<NoCropImage>` renderované.
3. **Markdown body** je prostor pro dva až čtyři paragrafy populárně-naučného textu — historie, chování, zajímavosti. Tón přístupný pro děti, ale věcný.

Příklad viz [src/content/species/cisarsky.md](src/content/species/cisarsky.md).

## Tech stack

- **Astro 6** + `@astrojs/cloudflare` (Workers, ne Pages)
- **TypeScript 5.9**
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **astro-icon** (lucide + tabler)
- **Fonts:** Inter přes `fontsource`
- **Markdown:** `remark-reading-time`
- **Content Collections** s `loader` API

Přidá se podle potřeby:
- Svelte 5 (runes) — pro interaktivní mapu a galerii ve Sprint 003
- Pagefind — fulltext ve Sprint 004
- daisyUI 5 — pokud bude potřeba UI knihovna

## Milníky

### MVP (Sprint 001 + 002)
- [x] Layout, branding, obrázková pravidla
- [x] Schema pro druhy se zdroji a licencí fotek
- [x] `/druhy` index a `/druhy/[slug]` detail
- [ ] Všech ~18 druhů naseedovaných se zdroji a fotkami (Run 006)

### V1 (Sprint 003 + 004)
- [ ] Mapa výskytu, historická osa, infografiky
- [ ] Fulltext vyhledávání, filtrace, related species

### Deploy (Sprint 005)
- [ ] A11y + SEO + OG images
- [ ] CF Workers deploy + doména

## Stav

**Sprint:** 002 **probíhá** — Runy 004 (index) + 005 (detail) hotové, 006 rozdělen do batchů (006a Pygoscelis hotový, 006b1 Aptenodytes+3 Eudyptes hotový = 8 druhů naseedováno)
**Další krok:** Run 006b2 — zbývající 3 Eudyptes (skalní severní, snaresky, Sclaterův), pak 006c (Megadyptes + Eudyptula + Spheniscus), pak 007 (galerie)
