import type { CollectionEntry } from "astro:content";

type SpeciesEntry = CollectionEntry<"species">;

// Deterministic index for a given day (UTC). Same day = same index.
// Rotates through the full species list; returns to start after length days.
function dayIndex(date: Date, length: number): number {
  const epochDay = Math.floor(date.getTime() / 86_400_000);
  return ((epochDay % length) + length) % length;
}

export function pickSpeciesOfDay(
  all: SpeciesEntry[],
  now: Date = new Date(),
): SpeciesEntry {
  if (all.length === 0) throw new Error("species list is empty");
  const sorted = [...all].sort((a, b) => a.id.localeCompare(b.id));
  return sorted[dayIndex(now, sorted.length)];
}

export function sortedSpecies(all: SpeciesEntry[]): SpeciesEntry[] {
  return [...all].sort((a, b) => a.id.localeCompare(b.id));
}
