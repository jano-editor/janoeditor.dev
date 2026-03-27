import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import * as schema from "./schema";

const DB_PATH = join(process.cwd(), "data", "jano.db");

let _db: ReturnType<typeof drizzle> | null = null;

export function useDB() {
  if (!_db) {
    mkdirSync(join(process.cwd(), "data"), { recursive: true });

    const sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");

    _db = drizzle(sqlite, { schema });

    // auto-create tables
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS plugins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        version TEXT NOT NULL,
        api_version INTEGER NOT NULL DEFAULT 1,
        description TEXT NOT NULL,
        extensions TEXT NOT NULL,
        author TEXT NOT NULL,
        license TEXT,
        homepage TEXT,
        repo_url TEXT NOT NULL,
        readme TEXT,
        published_by INTEGER NOT NULL,
        published_by_login TEXT NOT NULL,
        downloads INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }
  return _db;
}

export { schema };
