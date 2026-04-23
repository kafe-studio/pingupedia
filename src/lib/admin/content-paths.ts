// Maps logical content IDs used by admin UI to actual repo paths.
// Keep parsing here so UI code doesn't hardcode paths scattered across forms.

export type ContentKind = "species" | "page" | "quiz" | "site";

export interface ContentRef {
  kind: ContentKind;
  slug: string;
}

export function parseContentId(id: string): ContentRef {
  const [kind, ...rest] = id.split("/");
  if (!kind || rest.length === 0) throw new Error(`Invalid content id: ${id}`);
  if (kind !== "species" && kind !== "page" && kind !== "quiz" && kind !== "site") {
    throw new Error(`Unknown content kind: ${kind}`);
  }
  const slug = rest.join("/");
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Invalid slug: ${slug}`);
  return { kind, slug };
}

export function toRepoPath(ref: ContentRef): string {
  switch (ref.kind) {
    case "species":
      return `src/content/species/${ref.slug}.md`;
    case "page":
      return `src/pages/${ref.slug}.astro`;
    case "quiz":
      return `src/lib/games/quiz-data.ts`;
    case "site":
      return `src/config/site.ts`;
  }
}

export function toLogicalId(repoPath: string): ContentRef | null {
  const speciesMatch = repoPath.match(/^src\/content\/species\/([a-z0-9-]+)\.md$/);
  if (speciesMatch) return { kind: "species", slug: speciesMatch[1] };
  return null;
}
