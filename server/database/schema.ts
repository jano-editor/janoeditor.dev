import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const plugins = sqliteTable("plugins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  version: text("version").notNull(),
  apiVersion: integer("api_version").notNull().default(1),
  description: text("description").notNull(),
  extensions: text("extensions").notNull(), // JSON array stored as text
  author: text("author").notNull(),
  license: text("license"),
  homepage: text("homepage"),
  repoUrl: text("repo_url").notNull(),
  readme: text("readme"),
  // who published it (GitHub user ID)
  publishedBy: integer("published_by").notNull(),
  publishedByLogin: text("published_by_login").notNull(),
  downloads: integer("downloads").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type Plugin = typeof plugins.$inferSelect;
export type NewPlugin = typeof plugins.$inferInsert;
