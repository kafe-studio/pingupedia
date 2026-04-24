# Run 013b: Site config jako content collection + admin `/texty/site`

**Status:** DONE
**Date:** 2026-04-24
**Sprint:** 003-admin

> Dashboard unavailable (FOREIGN KEY chyba na createSprint) — run tracking jen lokálně.

## Kontext

Run 013a dokončil strukturovaný form pro editaci druhů. Tento run je **první krok k editaci ostatních textů na webu**: extrahuje site config z `src/config/site.ts` do JSON content collection a položí infrastrukturu (`/admin/texty/` shell + generický `/api/admin/texty/[id]` endpoint), na které staví Run 013c (homepage) a 013d (o-projektu).

## Zadání

- [x] `src/content/site/config.json` + `site` kolekce v `content.config.ts` + `src/lib/site.ts` helper (mcp)
- [x] Refaktor 8 konsumerů siteConfig → `await getSiteConfig()`, `src/config/site.ts` smazán
- [x] `/admin/texty/` shell (5 entries: site ready + 4 soon) + `/admin/texty/site/` form + `site-form-client.ts`
- [x] `/api/admin/texty/[id]` GET/PUT + content-paths rozšíření (page → `src/content/pages/*.json`, quiz → `src/content/quiz.json`, site → `src/content/site/config.json`)
- [x] Astro check + build 0/0/0 (75 files)

## Design

### Content collection

```ts
// content.config.ts
const site = defineCollection({
  loader: glob({ pattern: "config.json", base: "./src/content/site" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    url: z.url(),
    lang: z.string(),
    locale: z.string(),
    author: z.string(),
    twitter: z.string(),
    ogImage: z.string(),
    phone: z.string(),
    email: z.string(),
    address: z.string(),
    socialLinks: z.object({ instagram: z.string(), facebook: z.string() }),
    navLinks: z.array(z.object({ text: z.string(), href: z.string() })),
  }),
});
```

### Helper

```ts
// src/lib/site.ts
import { getEntry } from "astro:content";
export async function getSiteConfig() {
  const entry = await getEntry("site", "config");
  if (!entry) throw new Error("site/config.json missing");
  return entry.data;
}
export type SiteConfig = Awaited<ReturnType<typeof getSiteConfig>>;
```

### Refaktor konsumerů

Všichni konsumenti jsou v Astro SSR kontextu (.astro frontmatter + robots.txt.ts APIRoute) — top-level `await` funguje:

```astro
const siteConfig = await getSiteConfig();
```

### Admin API dispatch

`/api/admin/texty/[id]` resolves id přes `content-paths.ts`:
- `site` → `src/content/site/config.json`
- `page/home` → `src/content/pages/home.json` (Run 013c)
- `page/o-projektu` → `src/content/pages/o-projektu.json` (Run 013d)
- `quiz` → `src/content/quiz.json` (Run 013e)

Stejná GET/PUT sha flow jako species API. Obsah je JSON string, parse+validate na formuláři, stringify zpět.

## Risks

- **Breaking change**: `await getSiteConfig()` místo sync `siteConfig`. Všichni konsumenti musí být async-ready. Astro SSR + top-level await = OK.
- **Form pro nested object** (navLinks array, socialLinks objekt) — textarea s JSON? Nebo dynamické input řádky? Pro MVP: textarea s JSON pro navLinks (array), flat inputy pro socialLinks (2 známá pole).
- **Build time vs. runtime**: site config je konzumovaný prerendered stránkami → změna vyžaduje rebuild. Admin commit → GitHub → CF Workers Build → ~2 min deploy. Connected-repo auto-build dokumentován jako nespolehlivý, fallback `wrangler deploy`.

## Plán souborů

- `src/content/site/config.json` ~22 ř (extrakt z TS exportu)
- `src/content.config.ts` +15 ř (site kolekce)
- `src/lib/site.ts` ~18 ř (helper + type)
- `src/config/site.ts` — DELETE
- 7 konsumerů — malé edity (1–3 ř per file)
- `src/pages/admin/texty/index.astro` ~60 ř (list 3-4 entries)
- `src/pages/admin/texty/site.astro` ~180 ř (form s 11 scalar + 2 nested)
- `src/lib/admin/texty-form-client.ts` ~100 ř (hydrate + collect + PUT)
- `src/pages/api/admin/texty/[id].ts` ~110 ř (GET/PUT + id dispatch)
- `src/lib/admin/content-paths.ts` +10 ř (page/site/quiz mapping)

## Řešení

- **`src/content/site/config.json`** (22 ř) — extrakt z bývalého TS exportu, JSON formátování 2-space + trailing newline.
- **`src/content.config.ts`** (+25 ř) — přidaná `site` kolekce s glob loaderem `pattern: "config.json"` a Zod schématem (name/description/url/lang/locale/author/twitter/ogImage/phone/email/address/socialLinks.instagram+facebook/navLinks.min(1)).
- **`src/lib/site.ts`** (10 ř) — `getSiteConfig()` async wrapper kolem `getEntry("site", "config")` + typed `SiteConfig`.
- **Refaktor 8 konsumerů** — BaseLayout, GameLayout, Navbar, Footer, Seo, Schema, index.astro, robots.txt — všichni teď `const siteConfig = await getSiteConfig()` v `---` frontmatteru. Top-level await funguje v Astro SSR i v prerender. `src/config/site.ts` smazán.
- **`src/lib/admin/content-paths.ts`** — `page` mapping přesunut z `src/pages/${slug}.astro` na `src/content/pages/${slug}.json`; `quiz` z `quiz-data.ts` na `src/content/quiz.json`; `site` z `site.ts` na `src/content/site/config.json`. Připravené pro Run 013c (homepage JSON) a dál.
- **`src/pages/admin/texty/index.astro`** (93 ř) — list s 5 entries (site ready, 4 soon). Ready entry link `/admin/texty/site/` + badge s aktuálním názvem webu. Soon entries mají `aria-disabled` + `pointer-events-none`.
- **`src/pages/admin/texty/site.astro`** (157 ř) — 4 form sekce (základní info, kontakt, sociální, navigace) + commit, celkem 14 polí. NavLinks jako textarea ve formátu `Text | /href/` (jeden per řádek).
- **`src/lib/admin/site-form-client.ts`** (116 ř) — hydrate + collect + PUT, `navLinksToText`/`textToNavLinks` parser, JSON.stringify s 2-space indent + trailing newline.
- **`src/pages/api/admin/texty/[id].ts`** (128 ř) — generický dispatch endpoint. Validuje id regex `^[a-z]+\/[a-z0-9-]+$`, odmítá species (odkaz na /api/admin/species), JSON parse check před PUT, sha concurrency (409 handling), 200 kB limit.

## Poznámky

- **MCP (Context7):** query-docs `/withastro/docs` pro content collection data loader + JSON glob — potvrzeno `pattern: "config.json"` + `z.object(...)` schema je validní Astro 6 pattern.
- **Review WARNINGy (non-blocking):**
  - `site-form-client.ts:39` — `line.split("|")` selže pokud text/href obsahuje `|` (nenastává v českých labels).
  - `admin/texty/site.astro:98-103` — Instagram/Facebook inputy `type="text"` bez URL validation (schema tolerantní, user musí vkládat full URL).
- **Breaking change:** `siteConfig` je teď async. Všichni konsumenti jsou v Astro SSR kontextu (frontmatter/APIRoute) — `await` funguje. Pokud přibude client-side import (`siteConfig` v `<script>` bloku), musí získat data jinak (např. přes window.\_\_SITE\_\_ injected serverem, nebo data-* atributy).
- **Next:** Run 013c — homepage extrakce do `src/content/pages/home.json` + form; Run 013d — o-projektu; Run 013e — hry/kvíz; Run 013f — species gallery/sources add/remove UI.
- **Dashboard unavailable** — nebyl registrovaný run; bude dohnáno `/init` v samostatné session.
