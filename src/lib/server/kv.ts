import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { dbEnabled, kvLocalDelete, kvLocalGet, kvLocalSet } from "./db";

/**
 * Locul unde serverul ține datele (starea aplicației, token-urile rețelelor sociale):
 * - "supabase": în cloud, în Supabase Storage (un bucket privat). Merge pe Vercel, pe orice dispozitiv.
 *   Nu cere tabele sau SQL: bucket-ul se creează singur la prima scriere.
 * - "local": în baza SQLite din .data/, când rulezi aplicația pe calculator.
 * - "none": nicăieri pe server; datele rămân doar în browser.
 */
export type KvBackend = "supabase" | "local" | "none";

const BUCKET = process.env.SUPABASE_STATE_BUCKET ?? "platforma-data";

function supabaseKeys() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export function kvBackend(): KvBackend {
  if (supabaseKeys()) return "supabase";
  if (dbEnabled()) return "local";
  return "none";
}

let sb: SupabaseClient | null = null;
let bucketReady = false;

function supabase() {
  const keys = supabaseKeys();
  if (!keys) throw new Error("Lipsesc cheile Supabase.");
  sb ??= createClient(keys.url, keys.key, { auth: { persistSession: false, autoRefreshToken: false } });
  return sb;
}

async function ensureBucket() {
  if (bucketReady) return;
  const client = supabase();
  const { data } = await client.storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await client.storage.createBucket(BUCKET, { public: false });
    if (error && !/exist/i.test(error.message)) throw new Error(`Nu pot crea spațiul de stocare în Supabase: ${error.message}`);
  }
  bucketReady = true;
}

const objectPath = (key: string) => `${key.replace(/[^a-zA-Z0-9/_-]/g, "_")}.json`;

export async function kvGet<T = unknown>(key: string): Promise<T | null> {
  const backend = kvBackend();
  if (backend === "local") return kvLocalGet(key) as T | null;
  if (backend === "none") return null;
  await ensureBucket();
  const file = objectPath(key);
  const dir = file.includes("/") ? file.slice(0, file.lastIndexOf("/")) : "";
  const name = file.slice(dir ? dir.length + 1 : 0);
  // Verificăm întâi dacă fișierul există, ca o eroare de rețea să nu pară „nimic salvat”
  // (altfel browserul ar suprascrie datele din cloud).
  const listed = await supabase().storage.from(BUCKET).list(dir, { search: name, limit: 100 });
  if (listed.error) throw new Error(`Citirea din Supabase a eșuat: ${listed.error.message}`);
  if (!listed.data.some((f) => f.name === name)) return null;
  const { data, error } = await supabase().storage.from(BUCKET).download(file);
  if (error || !data) throw new Error(`Citirea din Supabase a eșuat: ${error?.message ?? "fără date"}`);
  return JSON.parse(await data.text()) as T;
}

export async function kvSet(key: string, value: unknown) {
  const backend = kvBackend();
  if (backend === "local") return kvLocalSet(key, value);
  if (backend === "none") throw new Error("Nu există stocare pe server.");
  await ensureBucket();
  const { error } = await supabase()
    .storage.from(BUCKET)
    .upload(objectPath(key), JSON.stringify(value), { upsert: true, contentType: "application/json" });
  if (error) throw new Error(`Salvarea în Supabase a eșuat: ${error.message}`);
}

export async function kvDelete(key: string) {
  const backend = kvBackend();
  if (backend === "local") return kvLocalDelete(key);
  if (backend === "none") return;
  await ensureBucket();
  await supabase().storage.from(BUCKET).remove([objectPath(key)]);
}
