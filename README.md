# pingupedia

Populárně-naučná encyklopedie všech druhů tučňáků v češtině. Pro děti i dospělé, z ověřených zdrojů, s bohatým vizuálním obsahem.

Nezávislý projekt (nesouvisí s Pinguworld).

## Tech stack

- **Astro 6** + `@astrojs/cloudflare` (Workers)
- **TypeScript 5.9**
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **astro-icon** (lucide + tabler), **Inter** font via fontsource

## Scripts

```bash
pnpm dev          # astro dev
pnpm build        # wrangler types && astro check && astro build
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint . --fix
pnpm test         # vitest
```

## Dokumentace

- [docs/PROJECT.md](docs/PROJECT.md) — záměr, obsahová a vizuální pravidla, stack, milníky
- [docs/PLAN.md](docs/PLAN.md) — rozpis sprintů a runů
- [docs/sprints/](docs/sprints/) — detail aktuálního sprintu a runů
