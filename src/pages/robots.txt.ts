import type { APIRoute } from "astro";
import { getSiteConfig } from "../lib/site";

export const prerender = true;

export const GET: APIRoute = async () => {
  const siteConfig = await getSiteConfig();
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${new URL("sitemap-index.xml", siteConfig.url).href}`;
  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
