// src/lib/auth.ts
const COOKIE_NAME = "admin_session";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET no está configurado en variables de entorno (producción/Amplify)");
  return secret;
}

function textToUint8(text: string) {
  return new TextEncoder().encode(text);
}

function uint8ToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function base64urlEncode(str: string) {
  return Buffer.from(str).toString("base64url");
}

function base64urlDecode(b64url: string) {
  return Buffer.from(b64url, "base64url").toString("utf8");
}

async function hmacSha256Hex(input: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    textToUint8(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, textToUint8(input));
  return uint8ToHex(new Uint8Array(sig));
}

/**
 * Token: base64url(payloadJson).signatureHex
 * payload: { exp: number, iat: number }
 */
export async function createAdminSessionToken() {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ONE_WEEK_SECONDS;

  const payloadStr = JSON.stringify({ iat, exp });
  const payloadB64 = base64urlEncode(payloadStr);

  const sig = await hmacSha256Hex(payloadB64);
  return `${payloadB64}.${sig}`;
}

function timingSafeEqualHex(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, sig] = parts;

  const expected = await hmacSha256Hex(payloadB64);
  if (!timingSafeEqualHex(sig, expected)) return false;

  let payload: { iat: number; exp: number };
  try {
    payload = JSON.parse(base64urlDecode(payloadB64));
  } catch {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload?.exp || now > payload.exp) return false;

  return true;
}

export const AdminCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  },
};