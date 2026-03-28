-- Add plugin_versions table and rename columns in plugins

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

-- backfill existing plugins into plugin_versions
INSERT OR IGNORE INTO plugin_versions (plugin_name, version, api_version, downloads, created_at)
SELECT name, latest_version, api_version, total_downloads, created_at FROM plugins;
