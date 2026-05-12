// Client for /admin/texty/home/
// Aktuální schema (od refaktoru 2026-05): sections[] (eyebrow/title/description s
// readonly preview metadaty), wowFacts (items[] value/label/mascot/surface),
// quizCta (eyebrow/titleHtml/description/buttonLabel/href). Form podporuje editaci
// jen textových polí — preview type, surface, speciesSlug atd. jsou readonly,
// drží se z původního JSON (pro pokročilou úpravu lze JSON přepsat v repu).

interface LoadResponse { content: string; sha: string; }
interface SaveResponse { commitSha: string; commitUrl: string; newSha: string; }
interface ErrorResponse { error: string; status?: number; }

type Surface = "aurora" | "ocean" | "sun" | "ice" | "candy";
type MascotPose = "ahoj" | "plave" | "detektiv" | "cte" | "radost" | "otazka" | "palec" | "wow" | "srdce" | "vajicko";
type PreviewType = "species-mosaic" | "species-photo" | "game-image" | "timeline-photo";

interface HomeSection {
  slug: string;
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  preview: PreviewType;
  speciesSlugs?: string[];
  speciesSlug?: string;
  gameImage?: string;
  timelineFile?: string;
  surface?: Surface;
}

interface WowFact {
  value: string;
  label: string;
  mascot: MascotPose;
  surface?: Surface;
}

interface HomePageData {
  hero: { eyebrow: string; titleHtml: string; subtitle: string };
  stats: { eyebrow: string; subtitle: string };
  sections: HomeSection[];
  wowFacts?: { eyebrow: string; title: string; items: WowFact[] };
  quizCta?: { eyebrow: string; titleHtml: string; description: string; buttonLabel: string; href: string };
  aboutCta: { eyebrow: string; titleHtml: string; description: string };
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

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "\"" ? "&quot;" : "&#39;"
  ));
}

function renderSections(sections: HomeSection[]): void {
  const container = $("sections-container");
  if (!container) return;
  container.innerHTML = sections.map((s, i) => `
    <div class="rounded-lg border border-border bg-background p-4 space-y-3">
      <div class="flex items-center justify-between gap-3 text-xs">
        <span class="font-mono text-primary font-bold">[${i + 1}] ${escapeHtml(s.slug)}</span>
        <span class="text-muted-foreground">${escapeHtml(s.href)} · preview: ${escapeHtml(s.preview)}${s.surface ? ` · surface: ${escapeHtml(s.surface)}` : ""}</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold mb-1" for="section-${i}-eyebrow">Eyebrow</label>
          <input id="section-${i}-eyebrow" type="text" required value="${escapeHtml(s.eyebrow)}" class="w-full rounded-md border border-border-interactive bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-semibold mb-1" for="section-${i}-title">Title</label>
          <input id="section-${i}-title" type="text" required value="${escapeHtml(s.title)}" class="w-full rounded-md border border-border-interactive bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold mb-1" for="section-${i}-description">Description</label>
        <textarea id="section-${i}-description" required rows="2" class="w-full rounded-md border border-border-interactive bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary">${escapeHtml(s.description)}</textarea>
      </div>
    </div>
  `).join("");
}

function renderWowFacts(items: WowFact[]): void {
  const container = $("wowfacts-container");
  if (!container) return;
  container.innerHTML = items.map((f, i) => `
    <div class="rounded-lg border border-border bg-background p-4 space-y-3">
      <div class="flex items-center justify-between gap-3 text-xs">
        <span class="font-mono text-primary font-bold">[${i + 1}]</span>
        <span class="text-muted-foreground">mascot: ${escapeHtml(f.mascot)}${f.surface ? ` · surface: ${escapeHtml(f.surface)}` : ""}</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold mb-1" for="wow-${i}-value">Hodnota</label>
          <input id="wow-${i}-value" type="text" required value="${escapeHtml(f.value)}" class="w-full rounded-md border border-border-interactive bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-semibold mb-1" for="wow-${i}-label">Popisek</label>
          <input id="wow-${i}-label" type="text" required value="${escapeHtml(f.label)}" class="w-full rounded-md border border-border-interactive bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>
    </div>
  `).join("");
}

function hydrateForm(d: HomePageData): void {
  setVal("heroEyebrow", d.hero.eyebrow);
  setVal("heroTitleHtml", d.hero.titleHtml);
  setVal("heroSubtitle", d.hero.subtitle);
  setVal("statsEyebrow", d.stats.eyebrow);
  setVal("statsSubtitle", d.stats.subtitle);
  setVal("aboutEyebrow", d.aboutCta.eyebrow);
  setVal("aboutTitleHtml", d.aboutCta.titleHtml);
  setVal("aboutDescription", d.aboutCta.description);
  renderSections(d.sections);
  if (d.wowFacts) {
    setVal("wowEyebrow", d.wowFacts.eyebrow);
    setVal("wowTitle", d.wowFacts.title);
    renderWowFacts(d.wowFacts.items);
  }
  if (d.quizCta) {
    setVal("quizEyebrow", d.quizCta.eyebrow);
    setVal("quizTitleHtml", d.quizCta.titleHtml);
    setVal("quizDescription", d.quizCta.description);
    setVal("quizButtonLabel", d.quizCta.buttonLabel);
    setVal("quizHref", d.quizCta.href);
  }
}

function collectForm(original: HomePageData): HomePageData {
  const sections: HomeSection[] = original.sections.map((s, i) => ({
    ...s,
    eyebrow: val(`section-${i}-eyebrow`),
    title: val(`section-${i}-title`),
    description: val(`section-${i}-description`),
  }));

  const next: HomePageData = {
    hero: {
      eyebrow: val("heroEyebrow"),
      titleHtml: val("heroTitleHtml"),
      subtitle: val("heroSubtitle"),
    },
    stats: { eyebrow: val("statsEyebrow"), subtitle: val("statsSubtitle") },
    sections,
    aboutCta: {
      eyebrow: val("aboutEyebrow"),
      titleHtml: val("aboutTitleHtml"),
      description: val("aboutDescription"),
    },
  };

  if (original.wowFacts) {
    next.wowFacts = {
      eyebrow: val("wowEyebrow"),
      title: val("wowTitle"),
      items: original.wowFacts.items.map((f, i) => ({
        ...f,
        value: val(`wow-${i}-value`),
        label: val(`wow-${i}-label`),
      })),
    };
  }

  if (original.quizCta) {
    next.quizCta = {
      eyebrow: val("quizEyebrow"),
      titleHtml: val("quizTitleHtml"),
      description: val("quizDescription"),
      buttonLabel: val("quizButtonLabel"),
      href: val("quizHref"),
    };
  }

  return next;
}

async function savePage(id: string, original: HomePageData): Promise<void> {
  const btn = $("submit-btn") as HTMLButtonElement | null; if (!btn) return;
  const sha = val("file-sha"); if (!sha) { showError("Chybí sha — reload stránky."); return; }

  let next: HomePageData;
  try { next = collectForm(original); } catch (err) {
    showError(err instanceof Error ? err.message : String(err)); return;
  }
  const newContent = JSON.stringify(next, null, 2) + "\n";
  const message = val("message") || "Edit homepage";

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

export function mountHomeForm(): void {
  const form = $("edit-form") as HTMLFormElement | null; if (!form) return;
  const id = form.dataset.id; if (!id) return;

  let original: HomePageData | null = null;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!original) return;
    void savePage(id, original);
  });

  void (async () => {
    const res = await fetch(`/api/admin/texty/${encodeURIComponent(id)}`);
    const data = (await res.json()) as LoadResponse | ErrorResponse;
    if (!res.ok) { showError((data as ErrorResponse).error ?? `HTTP ${res.status}`); return; }
    const file = data as LoadResponse;
    setVal("file-sha", file.sha);
    try {
      original = JSON.parse(file.content) as HomePageData;
      hydrateForm(original);
    } catch (err) {
      showError(`JSON parse error: ${err instanceof Error ? err.message : String(err)}`); return;
    }
    $("loading")?.classList.add("hidden"); form.classList.remove("hidden");
  })();
}
