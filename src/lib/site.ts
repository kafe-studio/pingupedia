import { getEntry } from "astro:content";

export async function getSiteConfig() {
  const entry = await getEntry("site", "config");
  if (!entry) throw new Error("src/content/site/config.json not found");
  return entry.data;
}

export type SiteConfig = Awaited<ReturnType<typeof getSiteConfig>>;
