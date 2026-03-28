import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import * as schema from "./schema";

const DB_PATH = join(process.cwd(), "data", "jano.db");

let _db: ReturnType<typeof drizzle> | null = null;

const migrations: { name: string; sql: string }[] = [
  {
    name: "001_add_versions",
    sql: `
      ALTER TABLE plugins RENAME COLUMN version TO latest_version;
      ALTER TABLE plugins RENAME COLUMN downloads TO total_downloads;

      CREATE TABLE IF NOT EXISTS plugin_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plugin_name TEXT NOT NULL,
        version TEXT NOT NULL,
        api_version INTEGER NOT NULL DEFAULT 1,
        downloads INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        UNIQUE(plugin_name, version)
      );

      INSERT OR IGNORE INTO plugin_versions (plugin_name, version, api_version, downloads, created_at)
      SELECT name, latest_version, api_version, total_downloads, created_at FROM plugins;
    `,
  },
];

function runMigrations(sqlite: InstanceType<typeof Database>) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set(
    (sqlite.prepare("SELECT name FROM _migrations").all() as { name: string }[]).map((r) => r.name),
  );

  for (const migration of migrations) {
    if (applied.has(migration.name)) continue;
    console.log(`[jano-db] Running migration: ${migration.name}`);
    sqlite.exec(migration.sql);
    sqlite
      .prepare("INSERT INTO _migrations (name, applied_at) VALUES (?, ?)")
      .run(migration.name, new Date().toISOString());
  }
}

export function useDB() {
  if (!_db) {
    mkdirSync(join(process.cwd(), "data"), { recursive: true });

    const sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");

    // create initial tables with original schema
    // migrations bring it up to date
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

    runMigrations(sqlite);

    _db = drizzle(sqlite, { schema });
  }
  return _db;
}

export { schema };
