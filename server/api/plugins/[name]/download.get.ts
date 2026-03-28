import { useDB, schema } from "~~/server/database";
import { eq, and } from "drizzle-orm";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, "name");
  if (!name) throw createError({ statusCode: 400, message: "Plugin name required" });

  const query = getQuery(event);
  const requestedVersion = (query.version as string) || null;

  const db = useDB();
  const plugin = db.select().from(schema.plugins).where(eq(schema.plugins.name, name)).get();
  if (!plugin) throw createError({ statusCode: 404, message: "Plugin not found" });

  const version = requestedVersion || plugin.latestVersion;

  // verify version exists
  if (requestedVersion) {
    const versionEntry = db
      .select()
      .from(schema.pluginVersions)
      .where(
        and(eq(schema.pluginVersions.pluginName, name), eq(schema.pluginVersions.version, version)),
      )
      .get();
    if (!versionEntry) {
      throw createError({ statusCode: 404, message: `Version ${version} not found.` });
    }
  }

  const zipPath = join(process.cwd(), "data", "artifacts", plugin.name, `${version}.zip`);

  if (!existsSync(zipPath)) {
    throw createError({
      statusCode: 404,
      message: "Artifact not found. Plugin may need to be republished.",
    });
  }

  // increment download counts
  db.update(schema.plugins)
    .set({ totalDownloads: plugin.totalDownloads + 1 })
    .where(eq(schema.plugins.name, name))
    .run();

  db.update(schema.pluginVersions)
    .set({
      downloads:
        (db
          .select()
          .from(schema.pluginVersions)
          .where(
            and(
              eq(schema.pluginVersions.pluginName, name),
              eq(schema.pluginVersions.version, version),
            ),
          )
          .get()?.downloads || 0) + 1,
    })
    .where(
      and(eq(schema.pluginVersions.pluginName, name), eq(schema.pluginVersions.version, version)),
    )
    .run();

  setResponseHeader(event, "Content-Type", "application/zip");
  setResponseHeader(
    event,
    "Content-Disposition",
    `attachment; filename="${plugin.name}-${version}.zip"`,
  );
  return readFileSync(zipPath);
});
