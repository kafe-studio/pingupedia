# Plan: pingupedia

**Vytvořeno:** 2026-04-19
**Aktualizováno:** 2026-04-27 (přidán Sprint 006/007/008 — i18n full content translation do 7 jazyků; mezitím proběhly ad-hoc runy: hry, security hardening, JSON API, fact-check, diving data, i18n MVP)

## Cíl

Populárně-naučná encyklopedie všech druhů tučňáků v češtině pro děti i dospělé. Bohaté fotografie, grafiky, mapy výskytu a historické souvislosti. Obsah pouze z ověřených zdrojů. Žádný obrázek nesmí být oříznutý.

## Sprinty

### Sprint 001 — Foundation & branding
**Stav:** hotovo
**Cíl:** Očistit kostru, nastavit brand, vytvořit species schema se zdroji a licencemi.

- [x] Run 001 — cleanup kostra, site config, brand → `docs/sprints/001-foundation/run-001-cleanup-brand.done.md`
- [x] Run 002 — layout, barevné schéma, obrázková pravidla (no-crop util) → `docs/sprints/001-foundation/run-002-layout-colors-image-rules.done.md`
- [x] Run 003 — species schema (cs), zdroje/citace, image handling → `docs/sprints/001-foundation/run-003-species-schema.done.md`

### Sprint 002 — Druhy
**Stav:** hotovo (2026-04-20, všech 17 druhů + galerie)
**Cíl:** `/druhy` index + detail stránky, seed všech ~18 druhů tučňáků se zdroji a fotkami.

- [x] Run 004 — `/druhy` index (karty bez ořezu) → `docs/sprints/002-species/run-004-druhy-index.done.md` (filtr podle rodu přesunut na Sprint 004 Run 012)
- [x] Run 005 — `/druhy/[slug]` detail (hero, fakta, historie, zdroje, galerie) → `docs/sprints/002-species/run-005-druhy-detail.done.md`
- [ ] Run 006 — seed všech druhů tučňáků s texty + fotkami + zdroji (rozdělený na batche)
  - [x] Run 006a — Pygoscelis (3 druhy: kroužkový, oslí, uzdičkový) → `docs/sprints/002-species/run-006a-pygoscelis.done.md`
  - [x] Run 006b1 — Aptenodytes patagonský + 3 Eudyptes (patagonský, skalní jižní, zlatovlasý, royal) → `docs/sprints/002-species/run-006b1-aptenodytes-eudyptes1.done.md`
  - [x] Run 006b2 — zbývající 3 Eudyptes (skalní severní, snareský, Sclaterův) → `docs/sprints/002-species/run-006b2-eudyptes-remaining.done.md`
  - [x] Run 006c1 — Megadyptes + Eudyptula + Spheniscus mendiculus (3 unikátní rody) → `docs/sprints/002-species/run-006c1-unique-genera.done.md`
  - [x] Run 006c2 — zbývající 3 Spheniscus (brýlový, Humboldtův, magellanský) → `docs/sprints/002-species/run-006c2-spheniscus-remaining.done.md`
- [ ] Run 007 — fotogalerie per druh (lightbox, responsivní, bez ořezu)
  - [x] Run 007a — lightbox infrastruktura (native `<dialog>`) + pilot cisarsky (3 fotky) → `docs/sprints/002-species/run-007a-lightbox-pilot.done.md`
  - [x] Run 007b — galerie patagonský + celý Pygoscelis rod (4 druhy × 3 fotky) → `docs/sprints/002-species/run-007b-aptenodytes-pygoscelis-gallery.done.md`
  - [x] Run 007c — galerie Eudyptes batch 1 (skalní jižní, zlatovlasý, royal) → `docs/sprints/002-species/run-007c-eudyptes-batch1.done.md`
  - [x] Run 007d — galerie Eudyptes batch 2 (skalní severní, snareský, Sclaterův) — rod Eudyptes 6/6 → `docs/sprints/002-species/run-007d-eudyptes-batch2.done.md`
  - [x] Run 007e1 — galerie Megadyptes + Eudyptula + 2 Spheniscus (zlutooky, nejmensi, brylovy, humboldtuv) → `docs/sprints/002-species/run-007e1-remaining-genera.done.md`
  - [x] Run 007e2 — galerie posledních 2 Spheniscus (magellansky, galapazsky) → **Sprint 002 KOMPLETNÍ** → `docs/sprints/002-species/run-007e2-final-spheniscus.done.md`

### Sprint 003 — Mapy, historie, infografiky
**Cíl:** Interaktivní vizualizace — mapa výskytu, časová osa, infografiky.

- [ ] Run 008 — mapa výskytu (world map s koloniemi)
- [ ] Run 009 — časová osa historie (objevování, expedice)
- [ ] Run 010 — infografiky (velikosti, potápění, status ohrožení)

### Sprint 004 — Discovery
**Cíl:** Vyhledávání, filtrace, navigace mezi druhy.

- [ ] Run 011 — fulltext vyhledávání (Pagefind)
- [ ] Run 012 — filtrace (rod, habitat, IUCN status, kontinent) — přejato z Sprint 002 Run 004
- [ ] Run 013 — related species, navigace

### Sprint 005 — Polish & deploy
**Cíl:** Dotáhnout UX a vypustit na CF Workers.

- [ ] Run 014 — about, zdroje, licence fotek, kredity
- [ ] Run 015 — a11y, OG images, SEO, performance
- [ ] Run 016 — CF Workers deploy + doména + 404 polish

### Sprint 006 — i18n Foundation + EN pilot
**Cíl:** Architektura per-locale content + plný překlad do EN (pilot, ověří pipeline). Cílové jazyky napříč Sprint 006/007: **cs (primary), en, de, fr, es, it, pl, uk**.

- [ ] Run 017 — i18n architektura: Astro 6 routing config, content collection refactor, language switcher refactor (mcp) → `docs/sprints/006-i18n-foundation/run-017-i18n-architecture.md`
- [ ] Run 018 — EN pilot: 4 druhy (cisarsky, brylovy, krouzkovy, osli) × frontmatter + body, ověřit E2E pipeline
- [ ] Run 019 — EN: zbývajících 14 druhů × frontmatter + body
- [ ] Run 020 — EN: page JSONs (home, hry, filmy, o-projektu, quiz) + site config + Sprint 006 audit

### Sprint 007 — Další jazyky (DE/FR/ES/IT/PL/UK)
**Cíl:** Replikovat EN pipeline pro zbývajících 6 jazyků.

- [ ] Run 021 — DE: 18 druhů + page JSONs + quiz
- [ ] Run 022 — FR: 18 druhů + page JSONs + quiz
- [ ] Run 023 — ES: 18 druhů + page JSONs + quiz
- [ ] Run 024 — IT: 18 druhů + page JSONs + quiz
- [ ] Run 025 — PL: 18 druhů + page JSONs + quiz
- [ ] Run 026 — UK: 18 druhů + page JSONs + quiz

### Sprint 008 — i18n polish
**Cíl:** Závěrečný audit všech 7 jazyků + cleanup.

- [ ] Run 027 — sprint audit všech 7 jazyků (build × 7 = 7× více stránek), broken links, fallback chování, hreflang, sitemap per-locale, finální UX cleanup

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
- Sprint 006 (i18n) závisí na Sprint 002 (obsah druhů k překladu) + na současném i18n MVP (UI dictionary).
- Sprint 007 závisí na Sprint 006 (architektura + EN pilot ověřuje pipeline).
- Sprint 008 závisí na Sprint 007 (audit po dokončení všech jazyků).

### i18n architektonické rozhodnutí (Sprint 006)
- **URL routing**: subpath (`/en/druhy/cisarsky/`), Astro 6 nativní `i18n.routing` config s `prefixDefaultLocale: false` (cs zůstává na `/druhy/cisarsky/`).
- **Content storage**: `{slug}.{locale}.md` pattern v `src/content/species/`, glob loader matchuje per locale. Pages podobně přes `home.{locale}.json`.
- **Hero titleHtml**: per-locale field v JSON (např. `hero.titleHtml.en`, `hero.titleHtml.de`) — vyžaduje schema rozšíření.
- **Drop**: 8 jazyků (kl, pt, hu, da, sv, ja, ko, zh) odstraněno z UI dictionary (commit 9543bfa, 2026-04-27).
- **Kvalita překladu**: strojová (LLM, žádný human review pass v plánu). Pro encyklopedický tón v UK/PL je riziko viditelných chyb — flag pro pozdější iteraci.
- **Build cost**: ~7× více prerendrovaných stránek; CF Workers build ~1 minuta → ~5 minut očekáváno.
- **Maintenance**: každá fact-check oprava v cs musí být replikována do 6 dalších jazyků.

### Ad-hoc runy mimo plán (2026-04-21 až 2026-04-27)
PLAN.md neobsahuje práci, která proběhla ad-hoc:
- **Hry**: platformovka (s 4 mini-hrami: ski/hockey/jump/dive), obrana (shooter), puzzle, pexeso, kviz — `/hry/*`
- **Diving data + fact-check**: schema `diving` + překlad fact-checked dat všech 18 druhů
- **JSON API**: `/api/druhy.json`, `/api/druhy/[slug].json` (CORS public)
- **Full audit + 3 hardening runy**: CSRF, constant-time login, RAF leak, JSON-LD escape, admin Cache-Control, render guards, theme seed, lightbox view-transition, roundRect polyfill, dt-scale physics, session iat+kid revocation, sanitize, schema validate, https-only URL
- **i18n MVP + 2 rozšíření**: 16→8 locales, ~34 UI klíčů, client-side overlay (předchází Sprint 006)
