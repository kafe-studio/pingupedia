// Client for /admin/texty/o-projektu/
// Load page/o-projektu JSON, hydrate form, collect back, PUT.

interface LoadResponse { content: string; sha: string; }
interface SaveResponse { commitSha: string; commitUrl: string; newSha: string; }
interface ErrorResponse { error: string; status?: number; }

type StatItem =
  | { label: string; dynamic: "species" | "genus" }
  | { label: string; value: string };

interface OProjektuData {
  meta: { title: string; description: string };
  hero: { eyebrow: string; titleHtml: string; subtitle: string };
  purpose: { eyebrow: string; title: string; body: string };
  audience: { eyebrow: string; title: string; subtitle: string };
  sources: { eyebrow: string; items: string[] };
  imageRules: { eyebrow: string; itemsHtml: string[] };
  stats: { eyebrow: string; items: StatItem[] };
  tech: { eyebrow: string; body: string; badges: string[] };
  catalogCta: { eyebrow: string; title: string };
  gamesCta: { eyebrow: string; title: string };
}

const $ = (id: string) => document.getElementById(id);
const val = (id: string): string => (($(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? "").trim();
const setVal = (id: string, v: string): void => {
  const el = $(id) as HTMLInputElement | HTMLTextAreaElement | null;
  if (el) el.value = v;
};

const HTML_ITEMS_SEP = /\r?\n---\r?\n/;

function showError(message: string): void {
  $("loading")?.classList.add("hidden");
  $("edit-form")?.classList.add("hidden");
  const box = $("error"); const msg = $("error-message");
  if (box && msg) { box.classList.remove("hidden"); msg.textContent = message; }
}

function linesToArray(s: string): string[] {
  return s.split("\n").map((x) => x.trim()).filter(Boolean);
}

function htmlItemsToText(items: string[]): string {
  return items.join("\n---\n");
}

function textToHtmlItems(text: string): string[] {
  return text.split(HTML_ITEMS_SEP).map((x) => x.trim()).filter(Boolean);
}

function statsToText(items: StatItem[]): string {
  return items.map((it) => {
    const val = "dynamic" in it ? `@${it.dynamic}` : it.value;
    return `${it.label} | ${val}`;
  }).join("\n");
}

function textToStats(text: string): StatItem[] {
  return text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error(`Neplatná statistika: "${line}" (očekáváno "Label | Hodnota" nebo "Label | @species/@genus")`);
    }
    const [label, rawValue] = parts;
    if (rawValue === "@species" || rawValue === "@genus") {
      return { label, dynamic: rawValue.slice(1) as "species" | "genus" };
    }
    return { label, value: rawValue };
  });
}

function hydrateForm(d: OProjektuData): void {
  setVal("metaTitle", d.meta.title); setVal("metaDescription", d.meta.description);
  setVal("heroEyebrow", d.hero.eyebrow); setVal("heroTitleHtml", d.hero.titleHtml);
  setVal("heroSubtitle", d.hero.subtitle);
  setVal("purposeEyebrow", d.purpose.eyebrow); setVal("purposeTitle", d.purpose.title);
  setVal("purposeBody", d.purpose.body);
  setVal("audienceEyebrow", d.audience.eyebrow); setVal("audienceTitle", d.audience.title);
  setVal("audienceSubtitle", d.audience.subtitle);
  setVal("sourcesEyebrow", d.sources.eyebrow);
  setVal("sourcesItems", d.sources.items.join("\n"));
  setVal("imageRulesEyebrow", d.imageRules.eyebrow);
  setVal("imageRulesItemsHtml", htmlItemsToText(d.imageRules.itemsHtml));
  setVal("statsEyebrow", d.stats.eyebrow);
  setVal("statsItems", statsToText(d.stats.items));
  setVal("techEyebrow", d.tech.eyebrow); setVal("techBody", d.tech.body);
  setVal("techBadges", d.tech.badges.join("\n"));
  setVal("catalogEyebrow", d.catalogCta.eyebrow); setVal("catalogTitle", d.catalogCta.title);
  setVal("gamesEyebrow", d.gamesCta.eyebrow); setVal("gamesTitle", d.gamesCta.title);
}

function collectForm(): OProjektuData {
  return {
    meta: { title: val("metaTitle"), description: val("metaDescription") },
    hero: { eyebrow: val("heroEyebrow"), titleHtml: val("heroTitleHtml"), subtitle: val("heroSubtitle") },
    purpose: { eyebrow: val("purposeEyebrow"), title: val("purposeTitle"), body: val("purposeBody") },
    audience: { eyebrow: val("audienceEyebrow"), title: val("audienceTitle"), subtitle: val("audienceSubtitle") },
    sources: { eyebrow: val("sourcesEyebrow"), items: linesToArray(val("sourcesItems")) },
    imageRules: { eyebrow: val("imageRulesEyebrow"), itemsHtml: textToHtmlItems(val("imageRulesItemsHtml")) },
    stats: { eyebrow: val("statsEyebrow"), items: textToStats(val("statsItems")) },
    tech: { eyebrow: val("techEyebrow"), body: val("techBody"), badges: linesToArray(val("techBadges")) },
    catalogCta: { eyebrow: val("catalogEyebrow"), title: val("catalogTitle") },
    gamesCta: { eyebrow: val("gamesEyebrow"), title: val("gamesTitle") },
  };
}

async function savePage(id: string): Promise<void> {
  const btn = $("submit-btn") as HTMLButtonElement | null; if (!btn) return;
  const sha = val("file-sha"); if (!sha) { showError("Chybí sha — reload stránky."); return; }

  let next: OProjektuData;
  try { next = collectForm(); } catch (err) {
    showError(err instanceof Error ? err.message : String(err)); return;
  }
  const newContent = JSON.stringify(next, null, 2) + "\n";
  const message = val("message") || "Edit o-projektu";

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

export function mountOProjektuForm(): void {
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
      const d = JSON.parse(file.content) as OProjektuData;
      hydrateForm(d);
    } catch (err) {
      showError(`JSON parse error: ${err instanceof Error ? err.message : String(err)}`); return;
    }
    $("loading")?.classList.add("hidden"); form.classList.remove("hidden");
  })();
}
