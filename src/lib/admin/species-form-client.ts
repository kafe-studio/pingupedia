// Client for /admin/druhy/[slug]/ structured form.
// Load → fetch API → parse markdown → hydrate form. Save → collect form → merge → stringify → PUT.

import {
  buildMarkdown,
  FrontmatterParseError,
  parseMarkdown,
  type ParsedMarkdown,
} from "./frontmatter";

interface LoadResponse { content: string; sha: string; size: number; }
interface SaveResponse { commitSha: string; commitUrl: string; newSha: string; }
interface ErrorResponse { error: string; status?: number; }

const $ = (id: string) => document.getElementById(id);
const val = (id: string): string => (($(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? "").trim();
const setVal = (id: string, v: string | number | undefined | null): void => {
  const el = $(id) as HTMLInputElement | HTMLTextAreaElement | null;
  if (el) el.value = v == null ? "" : String(v);
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

function arrayToLines(arr: unknown): string {
  return Array.isArray(arr) ? arr.map((x) => String(x)).join("\n") : "";
}

function getObj(fm: Record<string, unknown>, key: string): Record<string, unknown> {
  const v = fm[key];
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function hydrateForm(parsed: ParsedMarkdown, rawContent: string): void {
  const fm = parsed.frontmatter;
  const size = getObj(fm, "size");
  const lifespan = getObj(fm, "lifespan");
  const hero = getObj(fm, "hero");
  const h = Array.isArray(size.heightCm) ? (size.heightCm as unknown[]) : [];
  const w = Array.isArray(size.weightKg) ? (size.weightKg as unknown[]) : [];

  setVal("nameCs", fm.nameCs as string); setVal("nameLat", fm.nameLat as string);
  setVal("nameEn", fm.nameEn as string); setVal("genus", fm.genus as string);
  setVal("iucnStatus", (fm.iucnStatus as string) ?? "LC");
  setVal("description", fm.description as string); setVal("habitat", fm.habitat as string);
  setVal("population", fm.population as string); setVal("historicalNotes", fm.historicalNotes as string);
  setVal("heightMin", h[0] as number); setVal("heightMax", h[1] as number);
  setVal("weightMin", w[0] as number); setVal("weightMax", w[1] as number);
  setVal("distribution", arrayToLines(fm.distribution));
  setVal("diet", arrayToLines(fm.diet));
  setVal("wildYears", lifespan.wildYears as number);
  setVal("captivityYears", lifespan.captivityYears as number);
  setVal("heroSrc", hero.src as string); setVal("heroAlt", hero.alt as string);
  setVal("heroAuthor", hero.author as string); setVal("heroLicense", hero.license as string);
  setVal("heroSourceUrl", hero.sourceUrl as string);
  setVal("body", parsed.body.replace(/^\n+/, ""));
  setVal("raw", rawContent);
}

function collectForm(original: Record<string, unknown>): Record<string, unknown> {
  const merged = { ...original };
  const put = (k: string, v: unknown): void => {
    if (v === "" || v == null || (typeof v === "number" && Number.isNaN(v))) delete merged[k];
    else merged[k] = v;
  };
  const num = (s: string): number | undefined => (s === "" ? undefined : Number(s));

  put("nameCs", val("nameCs")); put("nameLat", val("nameLat"));
  put("nameEn", val("nameEn") || undefined); put("genus", val("genus"));
  put("iucnStatus", val("iucnStatus")); put("description", val("description"));
  put("habitat", val("habitat"));
  put("population", val("population") || undefined);
  put("historicalNotes", val("historicalNotes") || undefined);

  const size: Record<string, unknown> = { heightCm: [num(val("heightMin")), num(val("heightMax"))], weightKg: [num(val("weightMin")), num(val("weightMax"))] };
  merged.size = size;

  merged.distribution = linesToArray(val("distribution"));
  merged.diet = linesToArray(val("diet"));

  const wild = num(val("wildYears")); const capt = num(val("captivityYears"));
  const lifespan: Record<string, unknown> = { wildYears: wild };
  if (capt !== undefined) lifespan.captivityYears = capt;
  merged.lifespan = lifespan;

  const hero: Record<string, unknown> = { src: val("heroSrc"), alt: val("heroAlt"), author: val("heroAuthor"), license: val("heroLicense"), sourceUrl: val("heroSourceUrl") };
  merged.hero = hero;

  merged.updatedAt = new Date().toISOString().slice(0, 10);
  return merged;
}

async function saveStructured(slug: string): Promise<void> {
  const btn = $("submit-btn") as HTMLButtonElement | null; if (!btn) return;
  const sha = val("file-sha"); if (!sha) { showError("Chybí sha — reload stránky."); return; }

  let original: Record<string, unknown>;
  try {
    const parsed = parseMarkdown(val("raw") || "---\n---\n");
    original = parsed.frontmatter;
  } catch (err) {
    const msg = err instanceof FrontmatterParseError ? err.message : String(err);
    showError(`Původní soubor nelze parsovat: ${msg}`); return;
  }

  const newFm = collectForm(original);
  const newBody = val("body");
  const newContent = buildMarkdown(newFm, newBody);
  const message = val("message") || `Edit ${slug}`;

  btn.disabled = true; btn.textContent = "Ukládám…";
  const body = new FormData();
  body.set("content", newContent); body.set("sha", sha); body.set("message", message);
  const res = await fetch(`/api/admin/species/${slug}`, { method: "PUT", body });
  const data = (await res.json()) as SaveResponse | ErrorResponse;
  btn.disabled = false; btn.textContent = "Uložit a commit";

  if (!res.ok) { showError((data as ErrorResponse).error ?? `HTTP ${res.status}`); return; }
  const ok = data as SaveResponse;
  setVal("file-sha", ok.newSha); setVal("raw", newContent);
  const result = $("commit-result"); const link = $("commit-link") as HTMLAnchorElement | null;
  if (result && link) { link.href = ok.commitUrl; link.textContent = ok.commitSha.slice(0, 7); result.classList.remove("hidden"); }
}

export function mountSpeciesForm(): void {
  const form = $("edit-form") as HTMLFormElement | null; if (!form) return;
  const slug = form.dataset.slug; if (!slug) return;

  form.addEventListener("submit", (e) => { e.preventDefault(); void saveStructured(slug); });

  void (async () => {
    const res = await fetch(`/api/admin/species/${slug}`);
    const data = (await res.json()) as LoadResponse | ErrorResponse;
    if (!res.ok) { showError((data as ErrorResponse).error ?? `HTTP ${res.status}`); return; }
    const file = data as LoadResponse;
    setVal("file-sha", file.sha);
    try {
      const parsed = parseMarkdown(file.content);
      hydrateForm(parsed, file.content);
    } catch (err) {
      const msg = err instanceof FrontmatterParseError ? err.message : String(err);
      showError(`Soubor nelze parsovat: ${msg}. Použij raw editor ve footeru.`);
      setVal("raw", file.content); return;
    }
    $("loading")?.classList.add("hidden"); form.classList.remove("hidden");
  })();
}
