export const SESSION_COOKIE = "clinic_dashboard_session";
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function keyFor(password: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export interface Session {
  value: string;
  maxAge: number;
}

export async function createSession(
  password: string,
  now = Date.now(),
): Promise<Session> {
  const expiresAt = now + SESSION_TTL_SECONDS * 1000;
  const payload = String(expiresAt);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await keyFor(password),
    encoder.encode(payload),
  );

  return {
    value: `${payload}.${toBase64Url(new Uint8Array(signature))}`,
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function verifySession(
  value: string | undefined,
  password: string | undefined,
  now = Date.now(),
): Promise<boolean> {
  if (!value || !password) return false;

  const separator = value.indexOf(".");
  if (separator < 1) return false;

  const payload = value.slice(0, separator);
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return false;

  try {
    return await crypto.subtle.verify(
      "HMAC",
      await keyFor(password),
      fromBase64Url(value.slice(separator + 1)),
      encoder.encode(payload),
    );
  } catch {
    return false;
  }
}
