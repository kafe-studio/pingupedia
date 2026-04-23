import type { APIRoute } from "astro";
import { createGitHubClient, GitHubError } from "../../../../lib/admin/github";
import { toRepoPath } from "../../../../lib/admin/content-paths";

export const prerender = false;

const SLUG_RE = /^[a-z0-9-]+$/;

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

function validateSlug(slug: string | undefined): slug is string {
  return typeof slug === "string" && SLUG_RE.test(slug);
}

export const GET: APIRoute = async ({ params }) => {
  if (!validateSlug(params.slug)) return json({ error: "Invalid slug" }, 400);

  const c = await getClient();
  if (!c.ok) return json({ error: c.error }, c.status);

  const path = toRepoPath({ kind: "species", slug: params.slug });
  try {
    const file = await c.client.getFile(path);
    if (!file) return json({ error: `Soubor ${path} nenalezen v repu.` }, 404);
    return json({ content: file.content, sha: file.sha, size: file.size }, 200);
  } catch (err) {
    const msg = err instanceof GitHubError ? err.message : String(err);
    const status = err instanceof GitHubError ? err.status : 500;
    return json({ error: msg, status }, 502);
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  if (!validateSlug(params.slug)) return json({ error: "Invalid slug" }, 400);

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
    return json({ error: "Obsah přesahuje 200 kB — zmenši soubor." }, 413);
  }

  const c = await getClient();
  if (!c.ok) return json({ error: c.error }, c.status);

  const path = toRepoPath({ kind: "species", slug: params.slug });
  try {
    const result = await c.client.putFile(path, content, message.trim(), sha);
    return json(
      { commitSha: result.commitSha, commitUrl: result.commitUrl, newSha: result.sha },
      200,
    );
  } catch (err) {
    if (err instanceof GitHubError && err.status === 409) {
      return json(
        { error: "Soubor se mezitím změnil (409). Načti stránku znovu a zkus to." },
        409,
      );
    }
    const msg = err instanceof GitHubError ? err.message : String(err);
    return json({ error: msg }, 502);
  }
};
