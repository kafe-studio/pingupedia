// Minimal fetch-based GitHub REST client for CF Workers.
// Covers read/write of single text files on a branch. No deps, UTF-8 safe base64.

const API_BASE = "https://api.github.com";

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  userAgent?: string;
}

export interface GitHubFile {
  content: string;
  sha: string;
  size: number;
  path: string;
}

export interface CommitResult {
  sha: string;
  commitSha: string;
  commitUrl: string;
}

export interface RateLimit {
  limit: number;
  remaining: number;
  resetAt: Date;
}

export class GitHubError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

function encodeUtf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function decodeBase64ToUtf8(b64: string): string {
  const clean = b64.replace(/\s/g, "");
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function request(
  config: GitHubConfig,
  method: "GET" | "PUT",
  endpoint: string,
  body?: unknown,
): Promise<{ status: number; data: unknown; headers: Headers }> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": config.userAgent ?? "pingupedia-admin/1.0",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  return { status: res.status, data, headers: res.headers };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function assertOk(status: number, data: unknown, context: string): void {
  if (status >= 200 && status < 300) return;
  throw new GitHubError(status, `GitHub ${context} failed (HTTP ${status})`, data);
}

export function createGitHubClient(config: GitHubConfig) {
  const base = `/repos/${config.owner}/${config.repo}`;

  return {
    async getFile(path: string): Promise<GitHubFile | null> {
      const endpoint = `${base}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${encodeURIComponent(config.branch)}`;
      const { status, data } = await request(config, "GET", endpoint);
      if (status === 404) return null;
      assertOk(status, data, `getFile(${path})`);
      const file = data as { content?: string; sha: string; size: number; path: string; encoding?: string };
      if (file.encoding && file.encoding !== "base64") {
        throw new GitHubError(500, `Unexpected encoding ${file.encoding}`, data);
      }
      return {
        content: file.content ? decodeBase64ToUtf8(file.content) : "",
        sha: file.sha,
        size: file.size,
        path: file.path,
      };
    },

    async putFile(
      path: string,
      content: string,
      message: string,
      sha?: string,
    ): Promise<CommitResult> {
      const endpoint = `${base}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}`;
      const { status, data } = await request(config, "PUT", endpoint, {
        message,
        content: encodeUtf8ToBase64(content),
        branch: config.branch,
        ...(sha ? { sha } : {}),
      });
      assertOk(status, data, `putFile(${path})`);
      const result = data as { content: { sha: string }; commit: { sha: string; html_url: string } };
      return {
        sha: result.content.sha,
        commitSha: result.commit.sha,
        commitUrl: result.commit.html_url,
      };
    },

    async getRateLimit(): Promise<RateLimit> {
      const { status, data, headers } = await request(config, "GET", "/rate_limit");
      assertOk(status, data, "getRateLimit");
      const core = (data as { resources: { core: { limit: number; remaining: number; reset: number } } })
        .resources.core;
      void headers;
      return { limit: core.limit, remaining: core.remaining, resetAt: new Date(core.reset * 1000) };
    },
  };
}
