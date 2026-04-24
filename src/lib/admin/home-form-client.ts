// Client for /admin/texty/home/
// Load page/home JSON from GitHub, hydrate form, collect back into JSON, PUT.

interface LoadResponse { content: string; sha: string; }
interface SaveResponse { commitSha: string; commitUrl: string; newSha: string; }
interface ErrorResponse { error: string; status?: number; }

interface SpeciesCard { slug: string; genus: string; name: string; alt: string; }
interface HomePageData {
  hero: { eyebrow: string; titleHtml: string; subtitle: string };
  featured: { badge: string; slug: string; titleHtml: string; description: string; imageAlt: string };
  stats: { eyebrow: string; subtitle: string };
  catalogCta: { eyebrow: string; titleHtml: string; subtitle: string };
  speciesCards: SpeciesCard[];
  howSection: { eyebrow: string; titleHtml: string; items: string[] };
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

function linesToArray(s: string): string[] {
  return s.split("\n").map((x) => x.trim()).filter(Boolean);
}

function cardsToText(cards: SpeciesCard[]): string {
  return cards.map((c) => `${c.slug} | ${c.genus} | ${c.name} | ${c.alt}`).join("\n");
}

function textToCards(text: string): SpeciesCard[] {
  return text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length !== 4 || parts.some((p) => !p)) {
      throw new Error(`Neplatná karta druhu: "${line}" (očekáváno "slug | Rod Xxx | Název | Alt")`);
    }
    if (!/^[a-z0-9-]+$/.test(parts[0])) {
      throw new Error(`Neplatný slug: "${parts[0]}" (jen malá písmena, čísla, pomlčky)`);
    }
    return { slug: parts[0], genus: parts[1], name: parts[2], alt: parts[3] };
  });
}

function hydrateForm(d: HomePageData): void {
  setVal("heroEyebrow", d.hero.eyebrow);
  setVal("heroTitleHtml", d.hero.titleHtml);
  setVal("heroSubtitle", d.hero.subtitle);
  setVal("featuredBadge", d.featured.badge);
  setVal("featuredSlug", d.featured.slug);
  setVal("featuredTitleHtml", d.featured.titleHtml);
  setVal("featuredDescription", d.featured.description);
  setVal("featuredImageAlt", d.featured.imageAlt);
  setVal("statsEyebrow", d.stats.eyebrow);
  setVal("statsSubtitle", d.stats.subtitle);
  setVal("catalogEyebrow", d.catalogCta.eyebrow);
  setVal("catalogTitleHtml", d.catalogCta.titleHtml);
  setVal("catalogSubtitle", d.catalogCta.subtitle);
  setVal("speciesCards", cardsToText(d.speciesCards));
  setVal("howEyebrow", d.howSection.eyebrow);
  setVal("howTitleHtml", d.howSection.titleHtml);
  setVal("howItems", d.howSection.items.join("\n"));
  setVal("aboutEyebrow", d.aboutCta.eyebrow);
  setVal("aboutTitleHtml", d.aboutCta.titleHtml);
  setVal("aboutDescription", d.aboutCta.description);
}

function collectForm(original: HomePageData): HomePageData {
  return {
    hero: {
      eyebrow: val("heroEyebrow"),
      titleHtml: val("heroTitleHtml"),
      subtitle: val("heroSubtitle"),
    },
    featured: {
      badge: val("featuredBadge"),
      slug: original.featured.slug, // readonly, preserve original
      titleHtml: val("featuredTitleHtml"),
      description: val("featuredDescription"),
      imageAlt: val("featuredImageAlt"),
    },
    stats: { eyebrow: val("statsEyebrow"), subtitle: val("statsSubtitle") },
    catalogCta: {
      eyebrow: val("catalogEyebrow"),
      titleHtml: val("catalogTitleHtml"),
      subtitle: val("catalogSubtitle"),
    },
    speciesCards: textToCards(val("speciesCards")),
    howSection: {
      eyebrow: val("howEyebrow"),
      titleHtml: val("howTitleHtml"),
      items: linesToArray(val("howItems")),
    },
    aboutCta: {
      eyebrow: val("aboutEyebrow"),
      titleHtml: val("aboutTitleHtml"),
      description: val("aboutDescription"),
    },
  };
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
