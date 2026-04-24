// Client for /admin/texty/kviz/
// JSON textarea editor with client-side validation before PUT.

interface LoadResponse { content: string; sha: string; }
interface SaveResponse { commitSha: string; commitUrl: string; newSha: string; }
interface ErrorResponse { error: string; status?: number; }

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}
interface QuizData {
  questions: Question[];
}

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

function validateQuiz(raw: string): QuizData {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch (err) {
    throw new Error(`JSON parse: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Root musí být objekt s klíčem `questions`.");
  }
  const root = parsed as Record<string, unknown>;
  if (!Array.isArray(root.questions)) {
    throw new Error("Chybí pole `questions` na rootu.");
  }
  if (root.questions.length === 0) {
    throw new Error("Pole `questions` musí mít aspoň 1 otázku.");
  }
  root.questions.forEach((q: unknown, i: number) => {
    if (typeof q !== "object" || q === null) {
      throw new Error(`Otázka #${i + 1} není objekt.`);
    }
    const obj = q as Record<string, unknown>;
    if (typeof obj.question !== "string" || !obj.question.trim()) {
      throw new Error(`Otázka #${i + 1}: chybí nebo prázdný "question".`);
    }
    if (!Array.isArray(obj.options) || obj.options.length !== 4) {
      throw new Error(`Otázka #${i + 1}: "options" musí být pole 4 stringů.`);
    }
    if (obj.options.some((o) => typeof o !== "string" || !o.trim())) {
      throw new Error(`Otázka #${i + 1}: všechny "options" musí být neprázdné stringy.`);
    }
    if (typeof obj.correct !== "number" || !Number.isInteger(obj.correct) || obj.correct < 0 || obj.correct > 3) {
      throw new Error(`Otázka #${i + 1}: "correct" musí být celé číslo 0–3.`);
    }
    if (typeof obj.explanation !== "string" || !obj.explanation.trim()) {
      throw new Error(`Otázka #${i + 1}: chybí nebo prázdný "explanation".`);
    }
  });
  return parsed as QuizData;
}

async function saveQuiz(id: string): Promise<void> {
  const btn = $("submit-btn") as HTMLButtonElement | null; if (!btn) return;
  const sha = val("file-sha").trim(); if (!sha) { showError("Chybí sha — reload stránky."); return; }

  let data: QuizData;
  try { data = validateQuiz(val("json")); } catch (err) {
    showError(err instanceof Error ? err.message : String(err)); return;
  }
  const newContent = JSON.stringify(data, null, 2) + "\n";
  const message = val("message").trim() || "Edit kvíz";

  btn.disabled = true; btn.textContent = "Ukládám…";
  const body = new FormData();
  body.set("content", newContent); body.set("sha", sha); body.set("message", message);
  const res = await fetch(`/api/admin/texty/${encodeURIComponent(id)}`, { method: "PUT", body });
  const resp = (await res.json()) as SaveResponse | ErrorResponse;
  btn.disabled = false; btn.textContent = "Uložit a commit";

  if (!res.ok) { showError((resp as ErrorResponse).error ?? `HTTP ${res.status}`); return; }
  const ok = resp as SaveResponse;
  setVal("file-sha", ok.newSha);
  const result = $("commit-result"); const link = $("commit-link") as HTMLAnchorElement | null;
  if (result && link) { link.href = ok.commitUrl; link.textContent = ok.commitSha.slice(0, 7); result.classList.remove("hidden"); }
}

export function mountKvizForm(): void {
  const form = $("edit-form") as HTMLFormElement | null; if (!form) return;
  const id = form.dataset.id; if (!id) return;

  form.addEventListener("submit", (e) => { e.preventDefault(); void saveQuiz(id); });

  void (async () => {
    const res = await fetch(`/api/admin/texty/${encodeURIComponent(id)}`);
    const data = (await res.json()) as LoadResponse | ErrorResponse;
    if (!res.ok) { showError((data as ErrorResponse).error ?? `HTTP ${res.status}`); return; }
    const file = data as LoadResponse;
    setVal("file-sha", file.sha);
    // Pretty-print on load for better readability.
    try {
      const parsed = JSON.parse(file.content);
      setVal("json", JSON.stringify(parsed, null, 2));
    } catch {
      setVal("json", file.content);
    }
    $("loading")?.classList.add("hidden"); form.classList.remove("hidden");
  })();
}
