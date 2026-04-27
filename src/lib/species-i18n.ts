import type { CollectionEntry } from "astro:content";
import { getCollection, getEntry } from "astro:content";
import { LOCALES, type Locale } from "../i18n/ui";

export interface ParsedSpeciesId {
  slug: string;
  locale: Locale;
}

const LOCALE_SET = new Set<string>(LOCALES);
const LOCALE_SUFFIX_RE = /\.([a-z]{2})$/;

// `cisarsky.en` → { slug: "cisarsky", locale: "en" }
// `cisarsky` → { slug: "cisarsky", locale: "cs" }
// Neznámý suffix nebo víc-segmentový id (např. `cisarsky.foo`) ponechává cs default —
// zabraňuje záměně non-locale tečkových přípon za locale.
export function parseLocaleFromId(id: string): ParsedSpeciesId {
  const match = id.match(LOCALE_SUFFIX_RE);
  if (match && LOCALE_SET.has(match[1])) {
    return { slug: id.slice(0, match.index), locale: match[1] as Locale };
  }
  return { slug: id, locale: "cs" };
}

export function filterByLocale<T extends { id: string }>(
  entries: T[],
  locale: Locale,
): T[] {
  return entries.filter((e) => parseLocaleFromId(e.id).locale === locale);
}

// Najde species entry pro daný slug + locale s fallbackem na cs.
// Vrací null pokud ani primary, ani cs fallback neexistují.
export async function getSpeciesByLocale(
  slug: string,
  locale: Locale,
): Promise<CollectionEntry<"species"> | null> {
  const localizedId = locale === "cs" ? slug : `${slug}.${locale}`;
  const entry = await getEntry("species", localizedId);
  if (entry) return entry;
  if (locale === "cs") return null;
  return (await getEntry("species", slug)) ?? null;
}

// Vrátí všechny species entries pro daný locale, deduplikované podle slugu
// s cs fallbackem. Pokud existuje per-locale variant, ten má přednost.
export async function getAllSpeciesByLocale(
  locale: Locale,
): Promise<CollectionEntry<"species">[]> {
  const all = await getCollection("species");
  if (locale === "cs") {
    return filterByLocale(all, "cs");
  }
  const bySlug = new Map<string, CollectionEntry<"species">>();
  for (const entry of all) {
    const parsed = parseLocaleFromId(entry.id);
    if (parsed.locale === "cs") bySlug.set(parsed.slug, entry);
  }
  for (const entry of all) {
    const parsed = parseLocaleFromId(entry.id);
    if (parsed.locale === locale) bySlug.set(parsed.slug, entry);
  }
  return Array.from(bySlug.values());
}

// Page collections id parser — `home.en` → { name: "home", locale: "en" }, `home` → cs.
// Sdílí stejnou logiku jako species, ale nepředpokládá multi-segmentový slug.
export function parsePageId(id: string): { name: string; locale: Locale } {
  const match = id.match(LOCALE_SUFFIX_RE);
  if (match && LOCALE_SET.has(match[1])) {
    return { name: id.slice(0, match.index), locale: match[1] as Locale };
  }
  return { name: id, locale: "cs" };
}
