// Hall of Fame — leaderboard pro Ledovou výpravu uložený v localStorage.
// Top 10 záznamů, řazených podle score sestupně, time vzestupně jako tiebreaker.

const STORAGE_KEY = "pingupedia.platformovka.hof.v1";
const MAX_ENTRIES = 10;

export interface HofEntry {
  nick: string;
  score: number;
  timeSec: number;
  chicksDelivered: number;
  dateIso: string;
}

export function loadHof(): HofEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e): e is HofEntry =>
        typeof e === "object" && e !== null &&
        typeof (e as HofEntry).nick === "string" &&
        typeof (e as HofEntry).score === "number" &&
        typeof (e as HofEntry).timeSec === "number",
      )
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function saveHof(entries: HofEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // localStorage unavailable (private mode, quota) — silently fail
  }
}

/** Přidá záznam do Hall of Fame, vrátí seřazený seznam (max 10). */
export function addHofEntry(nick: string, score: number, timeSec: number, chicksDelivered: number): HofEntry[] {
  const entry: HofEntry = {
    nick: nick.trim().slice(0, 16) || "anonym",
    score,
    timeSec: Math.round(timeSec),
    chicksDelivered,
    dateIso: new Date().toISOString().slice(0, 10),
  };
  const all = [...loadHof(), entry].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSec - b.timeSec;
  });
  const top = all.slice(0, MAX_ENTRIES);
  saveHof(top);
  return top;
}

/** Vrátí pozici nového záznamu v top 10 (1-based) nebo -1 pokud se nedostane. */
export function rankOf(entry: HofEntry, all: HofEntry[]): number {
  const idx = all.findIndex((e) => e === entry || (e.dateIso === entry.dateIso && e.nick === entry.nick && e.score === entry.score));
  return idx >= 0 ? idx + 1 : -1;
}
