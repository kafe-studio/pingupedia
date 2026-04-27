// HMAC-signed session cookie helpers.
// Cookie format: <base64url(payloadJson)>.<base64url(hmacSha256)>
// Works in Cloudflare Workers (Web Crypto API, no Node deps).

export const COOKIE_NAME = "pingupedia_admin";
const DEFAULT_TTL_MS = 8 * 60 * 60 * 1000; // 8 h

// kid je krátký otisk SESSION_SECRET — když adminem otočený secret, staré cookies
// (jiné kid) okamžitě selžou ve verify, aniž by se musel TTL doexpirovat.
interface SessionPayload {
  exp: number;
  iat: number;
  kid: string;
}

async function deriveKid(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  const bytes = new Uint8Array(digest).slice(0, 6);
  return b64urlEncode(bytes);
}

const encoder = new TextEncoder();

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const bin = atob(input.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacSha256(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return new Uint8Array(sig);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function constantTimeEqualString(a: string, b: string): Promise<boolean> {
  const [da, db] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  return constantTimeEqual(new Uint8Array(da), new Uint8Array(db));
}

export async function createSessionCookie(
  secret: string,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<{ value: string; maxAgeSec: number }> {
  const now = Date.now();
  const payload: SessionPayload = {
    iat: now,
    exp: now + ttlMs,
    kid: await deriveKid(secret),
  };
  const encoded = b64urlEncode(encoder.encode(JSON.stringify(payload)));
  const sig = b64urlEncode(await hmacSha256(secret, encoded));
  return { value: `${encoded}.${sig}`, maxAgeSec: Math.floor(ttlMs / 1000) };
}

export async function verifySessionCookie(
  secret: string,
  cookieValue: string | undefined,
): Promise<boolean> {
  if (!cookieValue) return false;
  const [encoded, sig] = cookieValue.split(".");
  if (!encoded || !sig) return false;

  try {
    const expectedSig = b64urlEncode(await hmacSha256(secret, encoded));
    if (!constantTimeEqual(b64urlDecode(sig), b64urlDecode(expectedSig))) return false;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(encoded))) as Partial<SessionPayload>;
    if (typeof payload.exp !== "number" || payload.exp <= Date.now()) return false;
    if (typeof payload.iat !== "number" || payload.iat > Date.now()) return false;
    if (typeof payload.kid !== "string" || payload.kid !== (await deriveKid(secret))) return false;
    return true;
  } catch {
    return false;
  }
}

export function buildSetCookie(value: string, maxAgeSec: number, secure: boolean): string {
  const parts = [
    `${COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${maxAgeSec}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function buildClearCookie(secure: boolean): string {
  const parts = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Max-Age=0",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function isSameOriginRequest(request: Request, requestUrl: URL): boolean {
  const origin = request.headers.get("origin");
  if (origin) return origin === requestUrl.origin;
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === requestUrl.origin;
    } catch {
      return false;
    }
  }
  return false;
}

export function readCookie(header: string | null | undefined): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE_NAME) return rest.join("=");
  }
  return undefined;
}
