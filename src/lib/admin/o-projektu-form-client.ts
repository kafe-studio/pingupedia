// Client for /admin/texty/o-projektu/
// Load page/o-projektu JSON, hydrate form, collect back, PUT.

interface LoadResponse { content: string; sha: string; }
interface SaveResponse { commitSha: string; commitUrl: string; newSha: string; }
interface ErrorResponse { error: string; status?: number; }

interface OProjektuData {
  meta: { title: string; description: string };
  hero: { titleHtml: string; subtitle: string };
  personalNote: { body: string };
  sources: { eyebrow: string; items: string[] };
  purpose: { eyebrow: string; title: string; body: string };
  credits: {
    author: string;
    studio: string;
    email: string;
    portfolioUrl: string;
    portfolioLabel: string;
  };
}

const $ = (id: string) => document.getElementById(id);
const val = (id: string): string => (($(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? "").trim();
const setVal = (id: string, v: string): void => {
  const el = $(id) as HTMLInputElement | HTMLTextAreaElement | null;
  if (el) el.value = v;
};

function showError(message: string): void {
  $("loading")?.classList.add("hidden");
  $("edit-form")?.classList.add("hidden");
  const box = $("error"); const msg = $("error-message");
  if (box && msg) { box.classList.remove("hidden"); msg.textContent = message; }
}

function linesToArray(s: string): string[] {
  return s.split("\n").map((x) => x.trim()).filter(Boolean);
}

function hydrateForm(d: OProjektuData): void {
  setVal("metaTitle", d.meta.title); setVal("metaDescription", d.meta.description);
  setVal("heroTitleHtml", d.hero.titleHtml); setVal("heroSubtitle", d.hero.subtitle);
  setVal("personalNoteBody", d.personalNote.body);
  setVal("sourcesEyebrow", d.sources.eyebrow);
  setVal("sourcesItems", d.sources.items.join("\n"));
  setVal("purposeEyebrow", d.purpose.eyebrow); setVal("purposeTitle", d.purpose.title);
  setVal("purposeBody", d.purpose.body);
  setVal("creditsAuthor", d.credits.author); setVal("creditsStudio", d.credits.studio);
  setVal("creditsEmail", d.credits.email);
  setVal("creditsPortfolioUrl", d.credits.portfolioUrl);
  setVal("creditsPortfolioLabel", d.credits.portfolioLabel);
}

function collectForm(): OProjektuData {
  return {
    meta: { title: val("metaTitle"), description: val("metaDescription") },
    hero: { titleHtml: val("heroTitleHtml"), subtitle: val("heroSubtitle") },
    personalNote: { body: val("personalNoteBody") },
    sources: { eyebrow: val("sourcesEyebrow"), items: linesToArray(val("sourcesItems")) },
    purpose: { eyebrow: val("purposeEyebrow"), title: val("purposeTitle"), body: val("purposeBody") },
    credits: {
      author: val("creditsAuthor"),
      studio: val("creditsStudio"),
      email: val("creditsEmail"),
      portfolioUrl: val("creditsPortfolioUrl"),
      portfolioLabel: val("creditsPortfolioLabel"),
    },
  };
}

async function savePage(id: string): Promise<void> {
  const btn = $("submit-btn") as HTMLButtonElement | null; if (!btn) return;
  const sha = val("file-sha"); if (!sha) { showError("Chybí sha — reload stránky."); return; }

  const next = collectForm();
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
