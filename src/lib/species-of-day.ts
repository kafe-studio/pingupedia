import type { CollectionEntry } from "astro:content";
import { filterByLocale } from "./species-i18n";
import type { Locale } from "../i18n/ui";

type SpeciesEntry = CollectionEntry<"species">;

// Deterministic index for a given day (UTC). Same day = same index.
// Rotates through the full species list; returns to start after length days.
function dayIndex(date: Date, length: number): number {
  const epochDay = Math.floor(date.getTime() / 86_400_000);
  return ((epochDay % length) + length) % length;
}

// Default locale "cs" — `pickSpeciesOfDay` rotuje výhradně přes cs entries
// aby `species of day` byl jednou denně stabilní bez ohledu na to, kolik
// per-locale variants existuje. Per-locale URL stránka si pak getSpeciesByLocale
// zavolá pro slug vybraného druhu.
export function pickSpeciesOfDay(
  all: SpeciesEntry[],
  now: Date = new Date(),
  locale: Locale = "cs",
): SpeciesEntry {
  const filtered = filterByLocale(all, locale);
  if (filtered.length === 0) throw new Error("species list is empty");
  const sorted = [...filtered].sort((a, b) => a.id.localeCompare(b.id));
  return sorted[dayIndex(now, sorted.length)];
}

// Default locale "cs" filtruje per-locale soubory ven (id `cisarsky.en` apod.)
// — chrání proti URL kolizi v getStaticPaths až Run 018+ doplní per-locale obsah.
export function sortedSpecies(
  all: SpeciesEntry[],
  locale: Locale = "cs",
): SpeciesEntry[] {
  return filterByLocale(all, locale).sort((a, b) => a.id.localeCompare(b.id));
}
