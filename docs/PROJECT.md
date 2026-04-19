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
- [ ] Layout, branding, obrázková pravidla
- [ ] Schema pro druhy se zdroji a licencí fotek
- [ ] `/druhy` index a `/druhy/[slug]` detail
- [ ] Všech ~18 druhů naseedovaných se zdroji a fotkami

### V1 (Sprint 003 + 004)
- [ ] Mapa výskytu, historická osa, infografiky
- [ ] Fulltext vyhledávání, filtrace, related species

### Deploy (Sprint 005)
- [ ] A11y + SEO + OG images
- [ ] CF Workers deploy + doména

## Stav

**Sprint:** 001
**Hotové runy:** žádné
**Aktuální run:** 001
