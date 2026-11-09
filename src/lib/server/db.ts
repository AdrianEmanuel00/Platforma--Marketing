import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";

// Baza de date locală: un fișier SQLite în .data/, creat automat la prima pornire.
// Pe Vercel discul nu se păstrează, așa că acolo baza e oprită și datele rămân în browser.
// Când trecem pe Supabase, doar funcțiile din acest fișier se schimbă.

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

export function loadState(account: string): unknown | null {
  const row = open().prepare("select data from app_state where account = ?").get(account) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
}

export function saveState(account: string, state: unknown) {
  open()
    .prepare(
      "insert into app_state (account, data, updated_at) values (?, ?, ?) on conflict(account) do update set data = excluded.data, updated_at = excluded.updated_at",
    )
    .run(account, JSON.stringify(state), new Date().toISOString());
}

export function clearState(account: string) {
  open().prepare("delete from app_state where account = ?").run(account);
}
