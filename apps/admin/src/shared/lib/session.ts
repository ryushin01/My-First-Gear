/** 어드민 세션 쿠키. HMAC으로 서명해 위조를 막는다. (Web Crypto라 proxy와 서버 모두에서 쓴다) */
export const SESSION_COOKIE = "mfg_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

function secret(): string {
  const value = process.env.MFG_ADMIN_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") throw new Error("MFG_ADMIN_SECRET이 필요합니다.");
  return "dev-only-admin-secret";
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Buffer.from(signature).toString("base64url");
}

export async function createSessionValue(now = Date.now()): Promise<string> {
  const expires = String(now + SESSION_TTL_SECONDS * 1000);
  return `${expires}.${await hmac(expires)}`;
}

export async function verifySessionValue(value: string | undefined, now = Date.now()): Promise<boolean> {
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < now) return false;
  const expected = await hmac(expires);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
