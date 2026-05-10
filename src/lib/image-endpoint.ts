// Vlastní image endpoint pro Cloudflare Workers — drop-in replacement za
// @astrojs/cloudflare/image-transform-endpoint, který doplní výchozí `fit`
// pokud chybí (CF Images binding vrací HTTP 500 pro transform({width,height})
// bez fit).
//
// Robustness:
//   1. ArrayBuffer buffering source i transformed body — chytí stream-mid-flight
//      chyby do catch a vrátí fallback (originální asset) místo prázdného 500.
//   2. Všechny error responses mají `CDN-Cache-Control: no-store` (CF zone cache
//      je nikdy nekešuje) + `Cache-Control: no-store` (browser taky ne) — brání
//      cache poisoningu, který se nám stal několikrát: jednou cachovaný 500 by
//      jinak přetrvával celé hodiny / dny.

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

/** Error response — CF zone NIKDY nekešuje (CDN-Cache-Control: no-store).
 *  Brání tomu, aby se nám "zapekly" 500ky v edge cache jako se nám stalo. */
function errorResponse(body: BodyInit | null, status: number, contentType?: string): Response {
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "CDN-Cache-Control": "no-store",
    "Cloudflare-CDN-Cache-Control": "no-store",
  };
  if (contentType) headers["Content-Type"] = contentType;
  return new Response(body, { status, headers });
}

/** Fallback při selhání transformace — vrací originální asset.
 *  Krátká cache (1h) — kdyby se CF Images zotavil, refresh není kritický. */
function fallbackResponse(buffer: ArrayBuffer, sourceContentType: string | null): Response {
  return new Response(buffer, {
    headers: {
      "Content-Type": sourceContentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
      "X-Image-Fallback": "transform-failed",
    },
  });
}

async function handle(request: Request, images: CfImagesBinding, assets: AssetsBinding): Promise<Response> {
  const url = new URL(request.url);
  const href = url.searchParams.get("href");
  if (!href) return errorResponse("Bad Request", 400, "text/plain");
  if (isRemotePath(href) && !isRemoteAllowed(href, imageConfig as IsRemoteAllowedConfig)) {
    return errorResponse("Forbidden", 403, "text/plain");
  }

  let content: Response;
  try {
    const imageSrc = new URL(href, url.origin);
    content = isRemotePath(href)
      ? await fetch(imageSrc, { redirect: "manual" })
      : await assets.fetch(new Request(imageSrc));
  } catch {
    return errorResponse("Source fetch failed", 502, "text/plain");
  }
  if (content.status >= 300 && content.status < 400) return errorResponse("Not Found", 404, "text/plain");
  if (!content.body || content.status >= 400) return errorResponse(null, 404);

  const sourceContentType = content.headers.get("Content-Type");
  let sourceBuffer: ArrayBuffer;
  try {
    sourceBuffer = await content.arrayBuffer();
  } catch {
    return errorResponse("Source read failed", 502, "text/plain");
  }

  const outputFormat = supportedFormats[url.searchParams.get("f") ?? ""];
  if (!outputFormat) {
    return errorResponse(`Unsupported format: ${url.searchParams.get("f")}`, 400, "text/plain");
  }

  const width = url.searchParams.has("w")
    ? Number.parseInt(url.searchParams.get("w") as string)
    : undefined;
  const height = url.searchParams.has("h")
    ? Number.parseInt(url.searchParams.get("h") as string)
    : undefined;
  // Pokud má request oba rozměry a chybí fit, dovysvětlíme `cover` (CF binding bug fallback).
  const explicitFit = url.searchParams.get("fit");
  const fit = explicitFit ?? (width && height ? "cover" : null);

  const qRaw = url.searchParams.get("q");
  const quality = qRaw ? (qualityTable[qRaw] ?? Number.parseInt(qRaw)) : undefined;

  try {
    const result = await images
      .input(sourceBuffer)
      .transform({ width, height, fit })
      .output({ quality, format: outputFormat });

    const transformed = result.response();
    const transformedBuffer = await transformed.arrayBuffer();

    return new Response(transformedBuffer, {
      headers: {
        "Content-Type": outputFormat,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return fallbackResponse(sourceBuffer, sourceContentType);
  }
}

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: { IMAGES?: CfImagesBinding; ASSETS?: AssetsBinding } } }).runtime?.env;
  if (!env?.IMAGES || !env?.ASSETS) {
    return errorResponse("Image binding unavailable", 503, "text/plain");
  }
  return handle(request, env.IMAGES, env.ASSETS);
};
