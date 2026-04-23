// Client-side controller for /admin/druhy/[slug]/
// Fetches file from GitHub via our API, renders into textarea, submits edits back.

interface LoadResponse {
  content: string;
  sha: string;
  size: number;
}

interface SaveResponse {
  commitSha: string;
  commitUrl: string;
  newSha: string;
}

interface ErrorResponse {
  error: string;
  status?: number;
}

function $(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function showError(message: string): void {
  $("loading")?.classList.add("hidden");
  $("edit-form")?.classList.add("hidden");
  const box = $("error");
  const msg = $("error-message");
  if (box && msg) {
    box.classList.remove("hidden");
    msg.textContent = message;
  }
}

async function loadFile(slug: string): Promise<void> {
  const res = await fetch(`/api/admin/species/${slug}`);
  const data = (await res.json()) as LoadResponse | ErrorResponse;

  if (!res.ok) {
    const err = data as ErrorResponse;
    showError(err.error ?? `HTTP ${res.status}`);
    return;
  }

  const file = data as LoadResponse;
  const form = $("edit-form") as HTMLFormElement | null;
  const content = $("content") as HTMLTextAreaElement | null;
  const sha = $("file-sha") as HTMLInputElement | null;
  if (!form || !content || !sha) return;

  content.value = file.content;
  sha.value = file.sha;
  $("loading")?.classList.add("hidden");
  form.classList.remove("hidden");
}

async function saveFile(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const slug = form.dataset.slug;
  if (!slug) return;

  const btn = $("submit-btn") as HTMLButtonElement | null;
  const result = $("commit-result");
  const resultLink = $("commit-link") as HTMLAnchorElement | null;
  if (!btn) return;

  btn.disabled = true;
  btn.textContent = "Ukládám…";

  const body = new FormData(form);
  const res = await fetch(`/api/admin/species/${slug}`, { method: "PUT", body });
  const data = (await res.json()) as SaveResponse | ErrorResponse;

  btn.disabled = false;
  btn.textContent = "Uložit a commit";

  if (!res.ok) {
    const err = data as ErrorResponse;
    showError(err.error ?? `HTTP ${res.status}`);
    return;
  }

  const ok = data as SaveResponse;
  const sha = $("file-sha") as HTMLInputElement | null;
  if (sha) sha.value = ok.newSha;
  if (result && resultLink) {
    resultLink.href = ok.commitUrl;
    resultLink.textContent = ok.commitSha.slice(0, 7);
    result.classList.remove("hidden");
  }
}

export function mountSpeciesEditor(): void {
  const form = $("edit-form") as HTMLFormElement | null;
  if (!form) return;
  const slug = form.dataset.slug;
  if (!slug) return;

  form.addEventListener("submit", (e) => {
    void saveFile(e as SubmitEvent);
  });

  void loadFile(slug);
}
