export const SESSION_COOKIE = "gs_asset_session";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@gitanjalischools.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const FALLBACK_SECRET = "gitanjali-schools-inventory-dev-secret";

function secret(): string {
  return process.env.AUTH_SECRET ?? FALLBACK_SECRET;
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return toBase64Url(signature);
}

export type Session = { email: string; expiresAt: number };

export async function createSessionToken(email: string = ADMIN_EMAIL) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${email}|${expiresAt}`;
  return {
    token: `${expiresAt}.${await sign(payload)}`,
    expiresAt,
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<Session | null> {
  if (!token) return null;
  const separator = token.indexOf(".");
  if (separator <= 0) return null;

  const expiresAt = Number.parseInt(token.slice(0, separator), 10);
  const signature = token.slice(separator + 1);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

  try {
    const expected = await sign(`${ADMIN_EMAIL}|${expiresAt}`);
    if (expected.length !== signature.length) return null;

    let mismatch = 0;
    for (let index = 0; index < expected.length; index += 1) {
      mismatch |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
    }
    return mismatch === 0 ? { email: ADMIN_EMAIL, expiresAt } : null;
  } catch {
    return null;
  }
}
