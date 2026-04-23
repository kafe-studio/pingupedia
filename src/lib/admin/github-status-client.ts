// Client-side script for /admin/github/ — fetches /api/admin/github/status and renders outcome.

interface RateLimit { limit: number; remaining: number; resetAt: string }
interface SampleFile { path: string; size: number; sha: string; firstLine: string }
interface StatusData {
  configured: boolean;
  missing?: string[];
  owner?: string;
  repo?: string;
  branch?: string;
  rateLimit?: RateLimit;
  sampleFile?: SampleFile | null;
  error?: string;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    if (c === "&") return "&amp;";
    if (c === "<") return "&lt;";
    if (c === ">") return "&gt;";
    if (c === '"') return "&quot;";
    return "&#39;";
  });
}

function renderMissing(missing: string[]): string {
  return `<p class="text-amber-300">✗ Chybí env vars: <code>${escapeHtml(missing.join(", "))}</code>. Nastav přes <code>wrangler secret put</code> (token) a vars v wrangler.jsonc, pak redeploy.</p>`;
}

function renderError(message: string): string {
  return `<p class="text-red-300">✗ ${escapeHtml(message)}</p>`;
}

function renderOk(data: StatusData): string {
  const rate = data.rateLimit!;
  const reset = new Date(rate.resetAt).toLocaleString("cs-CZ");
  const parts = [
    `<p class="text-emerald-300">✓ Spojení funguje</p>`,
    `<p class="text-muted-foreground">Repo: <strong>${escapeHtml(data.owner!)}/${escapeHtml(data.repo!)} @ ${escapeHtml(data.branch!)}</strong></p>`,
    `<p class="text-muted-foreground">Rate limit: <strong>${rate.remaining} / ${rate.limit}</strong> (reset ${escapeHtml(reset)})</p>`,
  ];
  if (data.sampleFile) {
    const sf = data.sampleFile;
    parts.push(
      `<p class="text-muted-foreground">Sample: <code>${escapeHtml(sf.path)}</code> — ${sf.size} B, sha ${escapeHtml(sf.sha.slice(0, 7))}</p>`,
    );
  }
  return parts.join("");
}

export async function mountGithubStatus(): Promise<void> {
  const loading = document.getElementById("status-loading");
  const out = document.getElementById("status-output") as HTMLElement | null;
  const summary = document.getElementById("status-summary") as HTMLElement | null;
  if (!loading || !out || !summary) return;

  try {
    const res = await fetch("/api/admin/github/status");
    const data = (await res.json()) as StatusData;
    loading.classList.add("hidden");
    out.classList.remove("hidden");
    out.textContent = JSON.stringify(data, null, 2);
    summary.classList.remove("hidden");

    if (!data.configured) {
      summary.innerHTML = renderMissing(data.missing ?? []);
    } else if (data.error) {
      summary.innerHTML = renderError(data.error);
    } else {
      summary.innerHTML = renderOk(data);
    }
  } catch (err) {
    loading.textContent = "✗ Fetch selhal: " + (err instanceof Error ? err.message : String(err));
    loading.classList.add("text-red-300");
  }
}
