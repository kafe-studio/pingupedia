// Client for /admin/texty/hry/

interface LoadResponse { content: string; sha: string; }
interface SaveResponse { commitSha: string; commitUrl: string; newSha: string; }
interface ErrorResponse { error: string; status?: number; }

type Surface = "aurora" | "ocean" | "ice" | "sun" | "candy" | "midnight";
type MascotPose =
  | "ahoj" | "plave" | "detektiv" | "cte" | "radost"
  | "otazka" | "palec" | "wow" | "srdce" | "vajicko";
interface Game {
  slug: string;
  title: string;
  tag: string;
  description: string;
  surface: Surface;
  mascotPose: MascotPose;
}
interface HryData {
  meta: { title: string; description: string };
  hero: { eyebrow: string; titleHtml: string; subtitle: string };
  games: Game[];
  cta: { eyebrow: string; title: string; description: string };
}

const $ = (id: string) => document.getElementById(id);
const val = (id: string): string => (($(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? "").trim();
const setVal = (id: string, v: string): void => {
  const el = $(id) as HTMLInputElement | HTMLTextAreaElement | null;
  if (el) el.value = v;
};

const BLOCK_SEP = /\r?\n---\r?\n/;
const SURFACES: Surface[] = ["aurora", "ocean", "ice", "sun", "candy", "midnight"];
const MASCOT_POSES: MascotPose[] = [
  "ahoj", "plave", "detektiv", "cte", "radost",
  "otazka", "palec", "wow", "srdce", "vajicko",
];

function showError(message: string): void {
  $("loading")?.classList.add("hidden");
  $("edit-form")?.classList.add("hidden");
  const box = $("error"); const msg = $("error-message");
  if (box && msg) { box.classList.remove("hidden"); msg.textContent = message; }
}

function gamesToText(games: Game[]): string {
  return games.map((g) =>
    [
      `slug: ${g.slug}`,
      `title: ${g.title}`,
      `tag: ${g.tag}`,
      `description: ${g.description}`,
      `surface: ${g.surface}`,
      `mascotPose: ${g.mascotPose}`,
    ].join("\n"),
  ).join("\n---\n");
}

function parseBlock(block: string, index: number): Game {
  const kv: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx < 0) {
      throw new Error(`Karta #${index + 1}: řádek bez dvojtečky — "${trimmed}"`);
    }
    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();
    if (!key || !value) {
      throw new Error(`Karta #${index + 1}: prázdný klíč nebo hodnota — "${trimmed}"`);
    }
    kv[key] = value;
  }
  const required = ["slug", "title", "tag", "description", "surface", "mascotPose"];
  for (const k of required) {
    if (!kv[k]) throw new Error(`Karta #${index + 1}: chybí klíč "${k}"`);
  }
  if (!/^[a-z0-9-]+$/.test(kv.slug)) {
    throw new Error(`Karta #${index + 1}: neplatný slug "${kv.slug}"`);
  }
  if (!SURFACES.includes(kv.surface as Surface)) {
    throw new Error(`Karta #${index + 1}: surface "${kv.surface}" není z ${SURFACES.join("/")}`);
  }
  if (!MASCOT_POSES.includes(kv.mascotPose as MascotPose)) {
    throw new Error(`Karta #${index + 1}: mascotPose "${kv.mascotPose}" není z ${MASCOT_POSES.join("/")}`);
  }
  return {
    slug: kv.slug,
    title: kv.title,
    tag: kv.tag,
    description: kv.description,
    surface: kv.surface as Surface,
    mascotPose: kv.mascotPose as MascotPose,
  };
}

function textToGames(text: string): Game[] {
  return text.split(BLOCK_SEP).map((b) => b.trim()).filter(Boolean).map(parseBlock);
}

function hydrateForm(d: HryData): void {
  setVal("metaTitle", d.meta.title); setVal("metaDescription", d.meta.description);
  setVal("heroEyebrow", d.hero.eyebrow); setVal("heroTitleHtml", d.hero.titleHtml);
  setVal("heroSubtitle", d.hero.subtitle);
  setVal("games", gamesToText(d.games));
  setVal("ctaEyebrow", d.cta.eyebrow); setVal("ctaTitle", d.cta.title);
  setVal("ctaDescription", d.cta.description);
}

function collectForm(): HryData {
  return {
    meta: { title: val("metaTitle"), description: val("metaDescription") },
    hero: { eyebrow: val("heroEyebrow"), titleHtml: val("heroTitleHtml"), subtitle: val("heroSubtitle") },
    games: textToGames(val("games")),
    cta: { eyebrow: val("ctaEyebrow"), title: val("ctaTitle"), description: val("ctaDescription") },
  };
}

async function savePage(id: string): Promise<void> {
  const btn = $("submit-btn") as HTMLButtonElement | null; if (!btn) return;
  const sha = val("file-sha"); if (!sha) { showError("Chybí sha — reload stránky."); return; }

  let next: HryData;
  try { next = collectForm(); } catch (err) {
    showError(err instanceof Error ? err.message : String(err)); return;
  }
  const newContent = JSON.stringify(next, null, 2) + "\n";
  const message = val("message") || "Edit hry";

  btn.disabled = true; btn.textContent = "Ukládám…";
  const body = new FormData();
  body.set("content", newContent); body.set("sha", sha); body.set("message", message);
  const res = await fetch(`/api/admin/texty/${encodeURIComponent(id)}`, { method: "PUT", body });
  const data = (await res.json()) as SaveResponse | ErrorResponse;
  btn.disabled = false; btn.textContent = "Uložit a commit";

  if (!res.ok) { showError((data as ErrorResponse).error ?? `HTTP ${res.status}`); return; }
  const ok = data as SaveResponse;
  setVal("file-sha", ok.newSha);
  const result = $("commit-result"); const link = $("commit-link") as HTMLAnchorElement | null;
  if (result && link) { link.href = ok.commitUrl; link.textContent = ok.commitSha.slice(0, 7); result.classList.remove("hidden"); }
}

export function mountHryForm(): void {
  const form = $("edit-form") as HTMLFormElement | null; if (!form) return;
  const id = form.dataset.id; if (!id) return;

  form.addEventListener("submit", (e) => { e.preventDefault(); void savePage(id); });

  void (async () => {
    const res = await fetch(`/api/admin/texty/${encodeURIComponent(id)}`);
    const data = (await res.json()) as LoadResponse | ErrorResponse;
    if (!res.ok) { showError((data as ErrorResponse).error ?? `HTTP ${res.status}`); return; }
    const file = data as LoadResponse;
    setVal("file-sha", file.sha);
    try {
      const d = JSON.parse(file.content) as HryData;
      hydrateForm(d);
    } catch (err) {
      showError(`JSON parse error: ${err instanceof Error ? err.message : String(err)}`); return;
    }
    $("loading")?.classList.add("hidden"); form.classList.remove("hidden");
  })();
}
