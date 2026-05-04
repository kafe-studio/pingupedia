// Vlastní image endpoint pro Cloudflare Workers — drop-in replacement za
// @astrojs/cloudflare/image-transform-endpoint, který doplní výchozí `fit`
// pokud chybí. CF Images binding vrací HTTP 500 pro transform({width,height})
// bez fit; bug je v adapteru 13.3.0.
//
// Logika je 1:1 s adapterem (image-binding-transform.js), jen na řádku
// `transform({...})` přidáme fit fallback.

import type { APIRoute } from "astro";
import { imageConfig } from "astro:assets";

function isRemotePath(src: string): boolean {
  return /^(?:https?:)?\/\//i.test(src);
}

interface IsRemoteAllowedConfig {
  domains?: string[];
  remotePatterns?: { protocol?: string; hostname?: string; pathname?: string; port?: string }[];
}

function isRemoteAllowed(src: string, cfg: IsRemoteAllowedConfig): boolean {
  if (!isRemotePath(src)) return true;
  const url = new URL(src);
  for (const domain of cfg.domains ?? []) {
    if (url.hostname === domain) return true;
  }
  for (const p of cfg.remotePatterns ?? []) {
    if (p.hostname && url.hostname !== p.hostname) continue;
    if (p.protocol && url.protocol.replace(":", "") !== p.protocol) continue;
    return true;
  }
  return false;
}

const qualityTable: Record<string, number> = { low: 25, mid: 50, high: 80, max: 100 };
const supportedFormats: Record<string, string> = {
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
};

interface CfImagesBinding {
  input(body: ReadableStream<Uint8Array> | ArrayBuffer): {
    transform(opts: { width?: number; height?: number; fit?: string | null }): {
      output(opts: { format: string; quality?: number }): Promise<{ response(): Response }>;
    };
  };
}

interface AssetsBinding {
  fetch(req: Request | URL): Promise<Response>;
}

async function handle(request: Request, images: CfImagesBinding, assets: AssetsBinding): Promise<Response> {
  try {
    const url = new URL(request.url);
    const href = url.searchParams.get("href");
    if (!href) return new Response("Bad Request", { status: 400 });
    if (isRemotePath(href) && !isRemoteAllowed(href, imageConfig as IsRemoteAllowedConfig)) {
      return new Response("Forbidden", { status: 403 });
    }
    const imageSrc = new URL(href, url.origin);
    const content = isRemotePath(href)
      ? await fetch(imageSrc, { redirect: "manual" })
      : await assets.fetch(new Request(imageSrc));
    if (content.status >= 300 && content.status < 400) return new Response("Not Found", { status: 404 });
    if (!content.body) return new Response(null, { status: 404 });

    const outputFormat = supportedFormats[url.searchParams.get("f") ?? ""];
    if (!outputFormat) {
      return new Response(`Unsupported format: ${url.searchParams.get("f")}`, { status: 400 });
    }

    const width = url.searchParams.has("w")
      ? Number.parseInt(url.searchParams.get("w") as string)
      : undefined;
    const height = url.searchParams.has("h")
      ? Number.parseInt(url.searchParams.get("h") as string)
      : undefined;
    // CRUX OPRAVY: pokud má request oba rozměry a chybí fit, dovysvětlíme `cover`.
    const explicitFit = url.searchParams.get("fit");
    const fit = explicitFit ?? (width && height ? "cover" : null);

    const qRaw = url.searchParams.get("q");
    const quality = qRaw ? (qualityTable[qRaw] ?? Number.parseInt(qRaw)) : undefined;

    const result = await images
      .input(content.body)
      .transform({ width, height, fit })
      .output({ quality, format: outputFormat });

    const response = result.response();
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return response;
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: { IMAGES?: CfImagesBinding; ASSETS?: AssetsBinding } } }).runtime?.env;
  if (!env?.IMAGES || !env?.ASSETS) {
    return new Response("Image binding unavailable", { status: 503 });
  }
  return handle(request, env.IMAGES, env.ASSETS);
};
