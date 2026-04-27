import type { APIRoute } from "astro";
import { createGitHubClient, GitHubError } from "../../../../lib/admin/github";
import { parseContentId, toRepoPath } from "../../../../lib/admin/content-paths";
import { isSameOriginRequest } from "../../../../lib/admin/session";

export const prerender = false;

// Accepts ids like "site/config", "page/home", "quiz/default".
// Species has its own endpoint /api/admin/species/[slug].
const ID_RE = /^[a-z]+\/[a-z0-9-]+$/;

interface GitHubEnv {
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

async function getClient(): Promise<
  | { ok: true; client: ReturnType<typeof createGitHubClient> }
  | { ok: false; error: string; status: number }
> {
  const { env } = await import("cloudflare:workers");
  const ge = env as unknown as GitHubEnv;
  if (!ge.GITHUB_TOKEN || !ge.GITHUB_OWNER || !ge.GITHUB_REPO) {
    return { ok: false, error: "GitHub není nakonfigurovaný (chybí GITHUB_TOKEN/OWNER/REPO).", status: 503 };
  }
  return {
    ok: true,
    client: createGitHubClient({
      token: ge.GITHUB_TOKEN,
      owner: ge.GITHUB_OWNER,
      repo: ge.GITHUB_REPO,
      branch: ge.GITHUB_BRANCH ?? "main",
    }),
  };
}

function resolvePath(rawId: string | undefined): { ok: true; path: string } | { ok: false; error: string } {
  if (typeof rawId !== "string") {
    return { ok: false, error: "Neplatné id: (chybí)" };
  }
  let id: string;
  try {
    id = decodeURIComponent(rawId);
  } catch {
    return { ok: false, error: `Neplatné id: ${rawId}` };
  }
  if (!ID_RE.test(id)) {
    return { ok: false, error: `Neplatné id: ${id}` };
  }
  try {
    const ref = parseContentId(id);
    if (ref.kind === "species") {
      return { ok: false, error: "Species se edituje přes /api/admin/species/[slug]." };
    }
    return { ok: true, path: toRepoPath(ref) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export const GET: APIRoute = async ({ params }) => {
  const resolved = resolvePath(params.id);
  if (!resolved.ok) return json({ error: resolved.error }, 400);

  const c = await getClient();
  if (!c.ok) return json({ error: c.error }, c.status);

  try {
    const file = await c.client.getFile(resolved.path);
    if (!file) return json({ error: `Soubor ${resolved.path} nenalezen v repu.` }, 404);
    return json({ content: file.content, sha: file.sha, size: file.size, path: resolved.path }, 200);
  } catch (err) {
    const msg = err instanceof GitHubError ? err.message : String(err);
    return json({ error: msg }, 502);
  }
};

export const PUT: APIRoute = async ({ params, request, url }) => {
  if (!isSameOriginRequest(request, url)) return json({ error: "Forbidden" }, 403);
  const resolved = resolvePath(params.id);
  if (!resolved.ok) return json({ error: resolved.error }, 400);

  const form = await request.formData();
  const content = form.get("content");
  const sha = form.get("sha");
  const message = form.get("message");

  if (typeof content !== "string" || content.length === 0) {
    return json({ error: "Chybí obsah souboru." }, 400);
  }
  if (typeof sha !== "string" || sha.length === 0) {
    return json({ error: "Chybí sha (načti soubor znovu)." }, 400);
  }
  if (typeof message !== "string" || message.trim().length < 5) {
    return json({ error: "Commit message musí mít aspoň 5 znaků." }, 400);
  }
  if (content.length > 200_000) {
    return json({ error: "Obsah přesahuje 200 kB." }, 413);
  }

  // Sanity check for JSON entries — parse must succeed.
  if (resolved.path.endsWith(".json")) {
    try {
      JSON.parse(content);
    } catch {
      return json({ error: "Obsah není validní JSON." }, 400);
    }
  }

  const c = await getClient();
  if (!c.ok) return json({ error: c.error }, c.status);

  try {
    const result = await c.client.putFile(resolved.path, content, message.trim(), sha);
    return json(
      { commitSha: result.commitSha, commitUrl: result.commitUrl, newSha: result.sha },
      200,
    );
  } catch (err) {
    if (err instanceof GitHubError && err.status === 409) {
      return json(
        { error: "Soubor se mezitím změnil (409). Načti stránku znovu." },
        409,
      );
    }
    const msg = err instanceof GitHubError ? err.message : String(err);
    return json({ error: msg }, 502);
  }
};
