// Client for /admin/texty/site/
// Load site/config.json from GitHub, hydrate form, collect back into JSON, PUT.

interface LoadResponse { content: string; sha: string; }
interface SaveResponse { commitSha: string; commitUrl: string; newSha: string; }
interface ErrorResponse { error: string; status?: number; }

interface NavLink { text: string; href: string; }
interface SocialLinks { instagram: string; facebook: string; }
interface SiteConfig {
  name: string; description: string; url: string;
  lang: string; locale: string; author: string;
  twitter: string; ogImage: string;
  phone: string; email: string; address: string;
  socialLinks: SocialLinks;
  navLinks: NavLink[];
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

function navLinksToText(links: NavLink[]): string {
  return links.map((l) => `${l.text} | ${l.href}`).join("\n");
}

function textToNavLinks(text: string): NavLink[] {
  return text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error(`Neplatný řádek navigace: "${line}" (očekáváno "Název | /href/")`);
    }
    return { text: parts[0], href: parts[1] };
  });
}

function hydrateForm(cfg: SiteConfig): void {
  setVal("name", cfg.name); setVal("description", cfg.description);
  setVal("url", cfg.url); setVal("lang", cfg.lang); setVal("locale", cfg.locale);
  setVal("author", cfg.author ?? ""); setVal("twitter", cfg.twitter ?? "");
  setVal("ogImage", cfg.ogImage ?? "");
  setVal("phone", cfg.phone ?? ""); setVal("email", cfg.email ?? "");
  setVal("address", cfg.address ?? "");
  setVal("socialInstagram", cfg.socialLinks?.instagram ?? "");
  setVal("socialFacebook", cfg.socialLinks?.facebook ?? "");
  setVal("navLinks", navLinksToText(cfg.navLinks ?? []));
}

function collectForm(): SiteConfig {
  return {
    name: val("name"), description: val("description"),
    url: val("url"), lang: val("lang"), locale: val("locale"),
    author: val("author"), twitter: val("twitter"), ogImage: val("ogImage"),
    phone: val("phone"), email: val("email"), address: val("address"),
    socialLinks: { instagram: val("socialInstagram"), facebook: val("socialFacebook") },
    navLinks: textToNavLinks(val("navLinks")),
  };
}

async function saveConfig(id: string): Promise<void> {
  const btn = $("submit-btn") as HTMLButtonElement | null; if (!btn) return;
  const sha = val("file-sha"); if (!sha) { showError("Chybí sha — reload stránky."); return; }

  let newCfg: SiteConfig;
  try { newCfg = collectForm(); } catch (err) {
    showError(err instanceof Error ? err.message : String(err)); return;
  }
  const newContent = JSON.stringify(newCfg, null, 2) + "\n";
  const message = val("message") || "Edit site config";

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

export function mountSiteForm(): void {
  const form = $("edit-form") as HTMLFormElement | null; if (!form) return;
  const id = form.dataset.id; if (!id) return;

  form.addEventListener("submit", (e) => { e.preventDefault(); void saveConfig(id); });

  void (async () => {
    const res = await fetch(`/api/admin/texty/${encodeURIComponent(id)}`);
    const data = (await res.json()) as LoadResponse | ErrorResponse;
    if (!res.ok) { showError((data as ErrorResponse).error ?? `HTTP ${res.status}`); return; }
    const file = data as LoadResponse;
    setVal("file-sha", file.sha);
    try {
      const cfg = JSON.parse(file.content) as SiteConfig;
      hydrateForm(cfg);
    } catch (err) {
      showError(`JSON parse error: ${err instanceof Error ? err.message : String(err)}`); return;
    }
    $("loading")?.classList.add("hidden"); form.classList.remove("hidden");
  })();
}
