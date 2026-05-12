// Generic raw-JSON editor client pro admin texty.
// Pro content typy s mnoha položkami (filmy s desítkami filmů, chovy s 48
// zařízeními, timeline s 30 událostmi) je strukturovaný form nepraktický.
// Místo toho ukazujeme prettified JSON v textarea, klient validuje že je
// parsovatelný, a server validuje proti Zod schématu.

interface LoadResponse { content: string; sha: string; }
interface SaveResponse { commitSha: string; commitUrl: string; newSha: string; }
interface ErrorResponse { error: string; status?: number; }

const $ = (id: string) => document.getElementById(id);
const val = (id: string): string => (($(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? "");
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

function showInlineError(message: string): void {
  const inline = $("inline-error"); const msg = $("inline-error-message");
  if (inline && msg) { inline.classList.remove("hidden"); msg.textContent = message; }
}

function clearInlineError(): void {
  $("inline-error")?.classList.add("hidden");
}

async function savePage(id: string, defaultMessagePrefix: string): Promise<void> {
  const btn = $("submit-btn") as HTMLButtonElement | null; if (!btn) return;
  const sha = val("file-sha").trim();
  if (!sha) { showError("Chybí sha — reload stránky."); return; }

  clearInlineError();
  const rawJson = val("json-content");
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    showInlineError(`JSON parse error: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }

  const newContent = JSON.stringify(parsed, null, 2) + "\n";
  const message = val("message").trim() || defaultMessagePrefix;

  btn.disabled = true; btn.textContent = "Ukládám…";
  const body = new FormData();
  body.set("content", newContent); body.set("sha", sha); body.set("message", message);
  const res = await fetch(`/api/admin/texty/${encodeURIComponent(id)}`, { method: "PUT", body });
  const data = (await res.json()) as SaveResponse | ErrorResponse;
  btn.disabled = false; btn.textContent = "Uložit a commit";

  if (!res.ok) {
    showInlineError((data as ErrorResponse).error ?? `HTTP ${res.status}`);
    return;
  }
  const ok = data as SaveResponse;
  setVal("file-sha", ok.newSha);
  // Reformat zachované hodnoty po úspěšném save.
  setVal("json-content", newContent.trimEnd());
  const result = $("commit-result"); const link = $("commit-link") as HTMLAnchorElement | null;
  if (result && link) { link.href = ok.commitUrl; link.textContent = ok.commitSha.slice(0, 7); result.classList.remove("hidden"); }
}

function formatBtn(): void {
  const ta = $("json-content") as HTMLTextAreaElement | null;
  if (!ta) return;
  clearInlineError();
  try {
    const parsed = JSON.parse(ta.value);
    ta.value = JSON.stringify(parsed, null, 2);
  } catch (err) {
    showInlineError(`Nelze formátovat: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export function mountRawJsonForm(options: { defaultMessagePrefix: string }): void {
  const form = $("edit-form") as HTMLFormElement | null; if (!form) return;
  const id = form.dataset.id; if (!id) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    void savePage(id, options.defaultMessagePrefix);
  });

  $("format-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    formatBtn();
  });

  void (async () => {
    const res = await fetch(`/api/admin/texty/${encodeURIComponent(id)}`);
    const data = (await res.json()) as LoadResponse | ErrorResponse;
    if (!res.ok) { showError((data as ErrorResponse).error ?? `HTTP ${res.status}`); return; }
    const file = data as LoadResponse;
    setVal("file-sha", file.sha);
    // Pretty-format, kdyby v repu byl jednořádkový JSON.
    try {
      const parsed = JSON.parse(file.content);
      setVal("json-content", JSON.stringify(parsed, null, 2));
    } catch {
      setVal("json-content", file.content);
    }
    $("loading")?.classList.add("hidden"); form.classList.remove("hidden");
  })();
}
