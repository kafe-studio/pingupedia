# Plan: pingupedia

**Vytvořeno:** 2026-04-19
**Aktualizováno:** 2026-04-19 (Run 001 done)

## Cíl

Populárně-naučná encyklopedie všech druhů tučňáků v češtině pro děti i dospělé. Bohaté fotografie, grafiky, mapy výskytu a historické souvislosti. Obsah pouze z ověřených zdrojů. Žádný obrázek nesmí být oříznutý.

## Sprinty

### Sprint 001 — Foundation & branding
**Stav:** aktivní
**Cíl:** Očistit kostru, nastavit brand, vytvořit species schema se zdroji a licencemi.

- [x] Run 001 — cleanup kostra, site config, brand → `docs/sprints/001-foundation/run-001-cleanup-brand.done.md`
- [ ] Run 002 — layout, barevné schéma, obrázková pravidla (no-crop util) → `docs/sprints/001-foundation/run-002-layout-colors-image-rules.md`
- [ ] Run 003 — species schema (cs), zdroje/citace, image handling

### Sprint 002 — Druhy
**Cíl:** `/druhy` index + detail stránky, seed všech ~18 druhů tučňáků se zdroji a fotkami.

- [ ] Run 004 — `/druhy` index (karty bez ořezu, filtr podle rodu)
- [ ] Run 005 — `/druhy/[slug]` detail (hero, fakta, historie, zdroje, galerie)
- [ ] Run 006 — seed všech druhů tučňáků s texty + fotkami + zdroji
- [ ] Run 007 — fotogalerie per druh (lightbox, responsivní, bez ořezu)

### Sprint 003 — Mapy, historie, infografiky
**Cíl:** Interaktivní vizualizace — mapa výskytu, časová osa, infografiky.

- [ ] Run 008 — mapa výskytu (world map s koloniemi)
- [ ] Run 009 — časová osa historie (objevování, expedice)
- [ ] Run 010 — infografiky (velikosti, potápění, status ohrožení)

### Sprint 004 — Discovery
**Cíl:** Vyhledávání, filtrace, navigace mezi druhy.

- [ ] Run 011 — fulltext vyhledávání (Pagefind)
- [ ] Run 012 — filtrace (rod, habitat, IUCN status, kontinent)
- [ ] Run 013 — related species, navigace

### Sprint 005 — Polish & deploy
**Cíl:** Dotáhnout UX a vypustit na CF Workers.

- [ ] Run 014 — about, zdroje, licence fotek, kredity
- [ ] Run 015 — a11y, OG images, SEO, performance
- [ ] Run 016 — CF Workers deploy + doména + 404 polish

## Poznámky

### Vizuální pravidla (napříč projektem)
- Žádný `object-cover`, žádný crop. Celý obrázek viditelný.
- Preferovaný přístup: `aspect-ratio` kontejner + `object-contain`, nebo intrinsic dimensions bez kontejneru.
- Každá fotka má uvedeného autora, licenci, odkaz na zdroj.

### Zdroje obsahu
- Wikipedia (cs + en) — základní popis, taxonomie
- IUCN Red List — status ohrožení, trendy populace
- BirdLife International — distribuce, kolonie
- Vědecké publikace (via Wikipedia references)
- Wikimedia Commons — fotografie (CC-BY / public domain)

### Technická rozhodnutí
- Svelte se přidá až ve Sprint 003 (mapa, lightbox). Do té doby čisté Astro + vanilla JS.
- daisyUI zatím ne — možná přidat později, pokud bude potřeba UI knihovna.
- Pagefind ve Sprint 004 — static search index, dobře sedí s Astro SSR.

### Závislosti mezi sprinty
- Sprint 002 závisí na Sprint 001 (schema + layout).
- Sprint 003 (mapa) závisí na Sprint 002 (seed data s distribucí).
- Sprint 004 (search) závisí na Sprint 002 (obsah k indexaci).
