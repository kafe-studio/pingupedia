#!/usr/bin/env node
// Purge Cloudflare zone cache pro kafe.studio.
// Volá se automaticky na konci `pnpm ship` (po wrangler deploy), aby ze stale
// edge cache zmizely případné staré 5xx odpovědi (CF občas zacachuje 500ky
// při flapping CF Images bindingu — viz docs/incidents nebo git log).
//
// Token: env CLOUDFLARE_PURGE_TOKEN (priorita) nebo CLOUDFLARE_API_TOKEN.
// Token musí mít oprávnění Zone:Cache Purge:Purge na kafe.studio.
// Pokud token chybí, skript vypíše warning a skončí 0 (deploy už proběhl).

const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || "f81b9f9fdbb0d4db4561e88798872489";
const ZONE_NAME = "kafe.studio";

const token = process.env.CLOUDFLARE_PURGE_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.warn(`[purge-cf-cache] CLOUDFLARE_PURGE_TOKEN ani CLOUDFLARE_API_TOKEN není nastavený — purge přeskočen.`);
  console.warn(`[purge-cf-cache] Deploy proběhl, ale stará edge cache může pár hodin přetrvat.`);
  console.warn(`[purge-cf-cache] Manuální purge: https://dash.cloudflare.com/?zone=${ZONE_NAME}/caching/configuration`);
  process.exit(0);
}

const startedAt = Date.now();
let response;
try {
  response = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ purge_everything: true }),
  });
} catch (err) {
  console.warn(`[purge-cf-cache] Network error: ${err?.message ?? err}`);
  process.exit(0);
}

let payload;
try {
  payload = await response.json();
} catch {
  console.warn(`[purge-cf-cache] Neparsovatelná odpověď CF API (HTTP ${response.status})`);
  process.exit(0);
}

if (!payload?.success) {
  console.warn(`[purge-cf-cache] Purge selhal:`, JSON.stringify(payload?.errors ?? payload, null, 2));
  console.warn(`[purge-cf-cache] Token pravděpodobně nemá Zone:Cache Purge permission. Deploy proběhl OK.`);
  process.exit(0);
}

const elapsed = Date.now() - startedAt;
console.log(`[purge-cf-cache] ✓ Cache zóny ${ZONE_NAME} purgnuta (${elapsed}ms).`);
