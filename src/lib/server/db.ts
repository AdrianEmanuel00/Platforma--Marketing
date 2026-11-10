import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";

// Baza de date locală: un fișier SQLite în .data/, creat automat la prima pornire.
// Pe Vercel discul nu se păstrează, așa că acolo baza e oprită (folosim Supabase, vezi kv.ts).

export function dbEnabled() {
  if (process.env.LOCAL_DB === "off") return false;
  if (process.env.LOCAL_DB === "on") return true;
  return !process.env.VERCEL;
}

let db: DatabaseSync | null = null;

function open(): DatabaseSync {
  if (db) return db;
  // Încărcat la rulare, pe lângă bundler (Turbopack nu știe de node:sqlite). Cere Node 22.13+.
  const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as typeof import("node:sqlite");
  const file = process.env.LOCAL_DB_PATH ?? path.join(process.cwd(), ".data", "platforma.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  db = new DatabaseSync(file);
  db.exec(`
    create table if not exists app_state (
      account text primary key,
      data text not null,
      updated_at text not null
    );
  `);
  return db;
}

// Cheile sunt de forma „state/agency” sau „tokens/proj_x”; tabelul vechi app_state le ține pe toate.
export function kvLocalGet(key: string): unknown | null {
  const row = open().prepare("select data from app_state where account = ?").get(key) as { data: string } | undefined;
  if (row) return JSON.parse(row.data);
  // Compatibilitate: înainte, starea era salvată direct sub numele contului („agency”).
  if (key.startsWith("state/")) {
    const old = open().prepare("select data from app_state where account = ?").get(key.slice(6)) as { data: string } | undefined;
    return old ? JSON.parse(old.data) : null;
  }
  return null;
}

export function kvLocalSet(key: string, value: unknown) {
  open()
    .prepare(
      "insert into app_state (account, data, updated_at) values (?, ?, ?) on conflict(account) do update set data = excluded.data, updated_at = excluded.updated_at",
    )
    .run(key, JSON.stringify(value), new Date().toISOString());
}

export function kvLocalDelete(key: string) {
  open().prepare("delete from app_state where account = ?").run(key);
  if (key.startsWith("state/")) open().prepare("delete from app_state where account = ?").run(key.slice(6));
}
