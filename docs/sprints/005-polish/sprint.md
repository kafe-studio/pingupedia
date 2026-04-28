# Sprint 005: Polish & deploy

**Status:** audited
**Audit date:** 2026-04-28
**Cíl:** Uhladit UX, SEO, a11y, perf — připravit web do release-stavu na CF Workers.
**Runy:** 015–016

## Scope

Po dokončení Sprint 004 (search, filtr, related) zbývalo doladit hraniční prvky pro veřejné spuštění:
- Per-druh JSON-LD strukturovaná data + per-druh og:image pro sociální sítě
- aria-current v Navbar pro a11y
- 404 stránka s rozcestníkem
- Sitemap bez admin URL, robots.txt s Disallow
- LCP perf — fetchpriority="high" na hero obrázcích

CF Workers deploy + custom doména `pingupedia.kafe.studio` jsou hotové. Migrace na `pingupedia.cz` je DNS/business rozhodnutí mimo kódový scope.

## Runy

- [x] Run 015 — a11y + SEO (`79ae742`) — JSON-LD BlogPosting per druh, aria-current, per-druh og:image, BaseLayout typing
- [x] Run 016 — polish & deploy (`ea37808`) — 404 quick-jumps, sitemap admin filter, LCP fetchpriority, robots.txt Disallow

## Audit findings

PROBLEM: žádné.

WARNING:
1. Doménová nekonzistence — `robots.txt` referuje `pingupedia.kafe.studio`, sitemap obsahuje `pingupedia.cz` URL. Existing pre-Sprint 005, vyřeší se DNS migrací.
2. `index.astro` `featuredImage` je `loading="eager"` bez fetchpriority — minor, dva LCP kandidáti v jednom viewportu nejsou ideální.

Typecheck 0 errors. Žádné migrace. Žádné breaking changes.
