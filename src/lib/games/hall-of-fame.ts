// Hall of Fame — localStorage žebříček per hra.
// Každá hra má svůj klíč: pingupedia-hof-<gameId>.
// Top 10 záznamů, řazení desc (vyšší skóre lepší) nebo asc (kratší čas lepší).

export type HofEntry = {
  name: string;
  value: number;
  meta?: string;
  date: string;
};

export type HofSort = "desc" | "asc";

const HOF_PREFIX = "pingupedia-hof-";
const NAME_KEY = "pingupedia-hof-name";
const HOF_LIMIT = 10;
const NAME_MAX = 16;

const FORBIDDEN = [
  "kurva", "piča", "pica", "kokot", "fuck", "shit", "asshole", "nigger", "fag",
  "hovno", "debil", "mrdka", "cunt",
];

export function sanitizeName(raw: string): string {
  const trimmed = raw.trim().slice(0, NAME_MAX);
  if (!trimmed) return "Hráč";
  const lower = trimmed.toLowerCase();
  for (const bad of FORBIDDEN) {
    if (lower.includes(bad)) return "Anonym";
  }
  return trimmed;
}

export function loadHof(gameId: string): HofEntry[] {
  try {
    const raw = localStorage.getItem(HOF_PREFIX + gameId);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is HofEntry =>
        typeof e === "object" && e !== null &&
        typeof (e as HofEntry).name === "string" &&
        typeof (e as HofEntry).value === "number" &&
        typeof (e as HofEntry).date === "string",
    );
  } catch {
    return [];
  }
}

export function saveHof(
  gameId: string,
  entry: Omit<HofEntry, "date">,
  sort: HofSort,
): { entries: HofEntry[]; rank: number | null } {
  const list = loadHof(gameId);
  const full: HofEntry = {
    ...entry,
    name: sanitizeName(entry.name),
    date: new Date().toISOString().slice(0, 10),
  };
  list.push(full);
  list.sort((a, b) => (sort === "desc" ? b.value - a.value : a.value - b.value));
  const top = list.slice(0, HOF_LIMIT);
  const rank = top.indexOf(full);
  try {
    localStorage.setItem(HOF_PREFIX + gameId, JSON.stringify(top));
  } catch {
    /* localStorage disabled — ignore */
  }
  return { entries: top, rank: rank >= 0 ? rank + 1 : null };
}

export function clearHof(gameId: string): void {
  try {
    localStorage.removeItem(HOF_PREFIX + gameId);
  } catch {
    /* ignore */
  }
}

export function loadLastName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveLastName(name: string): void {
  try {
    localStorage.setItem(NAME_KEY, sanitizeName(name));
  } catch {
    /* ignore */
  }
}

export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
