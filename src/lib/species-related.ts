import type { CollectionEntry } from "astro:content";

type Species = CollectionEntry<"species">;

/**
 * Vrací 4 druhy nejvíce podobné `current` (vyloučen aktuální druh).
 *
 * Skóre podobnosti:
 *   +10 stejný rod (Pygoscelis → ostatní Pygoscelis druhy)
 *   +3  stejný IUCN status
 *   +2  blízká velikost (max výška do 30 % rozdíl)
 *   +1  blízká populace přes lifespan / habitat region (proxied jen heightCm)
 *
 * Tie-breaker: alfabetické řazení podle nameCs.
 */
export function getRelatedSpecies(current: Species, all: Species[], limit = 4): Species[] {
  const cd = current.data;
  const cMaxH = cd.size.heightCm[1];

  const scored = all
    .filter((s) => s.id !== current.id)
    .map((s) => {
      let score = 0;
      if (s.data.genus === cd.genus) score += 10;
      if (s.data.iucnStatus === cd.iucnStatus) score += 3;
      const sMaxH = s.data.size.heightCm[1];
      const heightDiff = Math.abs(sMaxH - cMaxH) / Math.max(sMaxH, cMaxH);
      if (heightDiff < 0.3) score += 2;
      if (heightDiff < 0.15) score += 1;
      return { s, score };
    });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.s.data.nameCs.localeCompare(b.s.data.nameCs, "cs");
  });

  return scored.slice(0, limit).map((x) => x.s);
}
