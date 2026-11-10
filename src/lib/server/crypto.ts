import "server-only";
import crypto from "node:crypto";

// Token-urile rețelelor sociale se salvează criptate (AES-256-GCM).
// Cheia vine din TOKEN_ENCRYPTION_KEY; dacă lipsește, o derivăm din secretul aplicației Meta.
function key() {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;
  if (raw) {
    const buf = Buffer.from(raw, "base64");
    if (buf.length === 32) return buf;
  }
  const fallback = process.env.META_APP_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!fallback) throw new Error("Lipsește TOKEN_ENCRYPTION_KEY.");
  return crypto.createHash("sha256").update(`platforma-tokens:${fallback}`).digest();
}

export function encrypt(text: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(payload: string) {
  const [iv, tag, data] = payload.split(".").map((p) => Buffer.from(p, "base64url"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/** Semnătură scurtă pentru parametrul `state` din login-ul cu Facebook (anti-CSRF). */
export function sign(value: string) {
  return crypto.createHmac("sha256", key()).update(value).digest("base64url").slice(0, 32);
}

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
