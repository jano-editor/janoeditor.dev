import { useDB, schema } from "~~/server/database";
import { eq } from "drizzle-orm";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, "name");
  if (!name) throw createError({ statusCode: 400, message: "Plugin name required" });

  const db = useDB();
  const plugin = db.select().from(schema.plugins).where(eq(schema.plugins.name, name)).get();
  if (!plugin) throw createError({ statusCode: 404, message: "Plugin not found" });

  const artifactDir = join(process.cwd(), "data", "artifacts", plugin.name, plugin.version);
  const indexPath = join(artifactDir, "index.js");
  const manifestPath = join(artifactDir, "plugin.json");

  if (!existsSync(indexPath) || !existsSync(manifestPath)) {
    throw createError({
      statusCode: 404,
      message: "Artifact not found. Plugin may need to be republished.",
    });
  }

  // increment download count
  db.update(schema.plugins)
    .set({ downloads: plugin.downloads + 1 })
    .where(eq(schema.plugins.name, name))
    .run();

  // return both files as JSON
  return {
    name: plugin.name,
    version: plugin.version,
    indexJs: readFileSync(indexPath, "utf8"),
    pluginJson: readFileSync(manifestPath, "utf8"),
  };
});
