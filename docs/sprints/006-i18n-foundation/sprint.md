# Sprint 006: i18n Foundation + EN pilot

**Status:** IN PROGRESS
**Dashboard Sprint:** 56
**Cíl:** Architektura per-locale content + plný překlad do EN jako pilot, který ověří pipeline před masovým rozšířením do dalších jazyků.
**Runy:** 017a–020

## Scope

Pingupedia dosud měla pouze český obsah + client-side UI overlay v 8 jazycích (cs/en/de/fr/es/it/pl/uk). Tento sprint zavádí **plnou per-locale content architekturu** a překládá veškerý obsah do angličtiny jako pilot.

Po dokončení sprintu bude:
- Astro 6 i18n routing s subpath URL (`/en/druhy/cisarsky/`)
- Content collections re-loadované z `{slug}.{locale}.md` pattern (cs primary v `cisarsky.md`, en v `cisarsky.en.md`)
- Page JSONs ve variantě `home.json` (cs) + `home.en.json` (EN)
- Per-locale hero `titleHtml` v page JSON schématu
- Language switcher přepíše URL místo client-side text overlay (URL je SEO source of truth)
- Všech 18 druhů přeloženo do EN (frontmatter + markdown body)
- Site config + 4 page JSONs + quiz JSON přeloženo do EN

Z čeho se vychází:
- **Sprint 002**: 18 druhů markdown s českým frontmatter+body
- **i18n MVP** (commits z 2026-04-27): client-side UI dictionary v 8 jazycích, dropdown switcher, persist v localStorage
- **Audit hardening**: schema validation, sanitize, https-only URLs (zachovat napříč locales)

Cílové jazyky napříč Sprint 006/007: **cs (primary), en (Sprint 006), de/fr/es/it/pl/uk (Sprint 007)**.

## Architektonická rozhodnutí

- **URL strategy**: subpath (`/en/druhy/cisarsky/`), Astro 6 `i18n.routing` config s `prefixDefaultLocale: false` (cs zůstává `/druhy/cisarsky/`)
- **Content storage**: `{slug}.{locale}.md` pattern (např. `cisarsky.md` = cs, `cisarsky.en.md` = EN)
- **Hero titleHtml**: per-locale variant pole v JSON schématu (vyžaduje rozšíření `lib/content-schemas.ts`)
- **Translation quality**: strojový překlad (LLM-grade), žádný human review pass naplánovaný — flag pro pozdější iteraci
- **Maintenance overhead**: každá fact-check oprava v cs zdroji musí být replikována do per-locale variant — vyřešíme později (procesní note)
- **Build cost**: ~7× více prerendrovaných stránek; ověříme v Run 017 proti CF Workers limitu

## Runy

Run 017 byl rozdělen na 017a + 017b kvůli scope (6 itemů > 5 limit per `/work`):

- [x] Run 017a — i18n základy: config, schema, helper modul → docs/sprints/006-i18n-foundation/run-017a-foundations.done.md
- [ ] Run 017b — page routing: per-locale getStaticPaths, LangSwitcher URL, 404 fallback → docs/sprints/006-i18n-foundation/run-017b-page-routing.md
- [ ] Run 018 — EN pilot: 4 druhy (cisarsky, brylovy, krouzkovy, osli) frontmatter + body, ověření E2E
- [ ] Run 019 — EN: zbývajících 14 druhů (frontmatter + body)
- [ ] Run 020 — EN: page JSONs (home, hry, filmy, o-projektu, quiz) + site config + Sprint 006 audit

Původní zadání všech 6 itemů zůstává v `run-017-i18n-architecture.md` jako kompletní reference.

## Závislosti

- Sprint 002 (obsah druhů k překladu) — hotov
- Audit hardening (schema validation pipeline) — hotov
- i18n MVP (UI dictionary + LangSwitcher komponenta) — hotov

## Definition of done

- `pnpm build` prochází s ~7× více prerendered stránkami
- `/en/druhy/cisarsky/` vrací anglický obsah s anglickým UI
- Language switcher mění URL (ne jen DOM)
- Všech 18 druhů má EN markdown variant (frontmatter + body)
- Page JSONs mají EN variants + per-locale `titleHtml`
- Sprint audit ověří fact-checked přesnost EN překladů + funkční URL routing per druh
