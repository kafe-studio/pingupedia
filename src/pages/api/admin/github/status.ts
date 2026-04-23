import type { APIRoute } from "astro";
import { createGitHubClient, GitHubError } from "../../../../lib/admin/github";

export const prerender = false;

interface StatusResponse {
  configured: boolean;
  missing?: string[];
  owner?: string;
  repo?: string;
  branch?: string;
  rateLimit?: { limit: number; remaining: number; resetAt: string };
  sampleFile?: { path: string; size: number; sha: string; firstLine: string } | null;
  error?: string;
}

function json(data: StatusResponse, status: number): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export const GET: APIRoute = async () => {
  const { env } = await import("cloudflare:workers");
  const ge = env as unknown as Record<string, string | undefined>;

  const token = ge.GITHUB_TOKEN;
  const owner = ge.GITHUB_OWNER;
  const repo = ge.GITHUB_REPO;
  const branch = ge.GITHUB_BRANCH ?? "main";

  const missing = ["GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO"].filter(
    (k) => !ge[k],
  );

  if (!token || !owner || !repo) {
    return json({ configured: false, missing }, 200);
  }

  const client = createGitHubClient({ token, owner, repo, branch });

  try {
    const [rateLimit, sample] = await Promise.all([
      client.getRateLimit(),
      client.getFile("src/content/species/cisarsky.md"),
    ]);

    return json(
      {
        configured: true,
        owner,
        repo,
        branch,
        rateLimit: {
          limit: rateLimit.limit,
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt.toISOString(),
        },
        sampleFile: sample
          ? {
              path: sample.path,
              size: sample.size,
              sha: sample.sha,
              firstLine: sample.content.split("\n")[0] ?? "",
            }
          : null,
      },
      200,
    );
  } catch (err) {
    const msg = err instanceof GitHubError ? `${err.message}` : String(err);
    return json({ configured: true, owner, repo, branch, error: msg }, 200);
  }
};
