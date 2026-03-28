import { useDB, schema } from "~~/server/database";
import { eq, and } from "drizzle-orm";
import { join } from "node:path";
import { rmSync, existsSync } from "node:fs";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const user = session.user as { id: number; login: string };

  const name = getRouterParam(event, "name");
  if (!name) throw createError({ statusCode: 400, message: "Plugin name required" });

  const body = await readBody<{ version?: string }>(event);

  const db = useDB();
  const plugin = db.select().from(schema.plugins).where(eq(schema.plugins.name, name)).get();
  if (!plugin) throw createError({ statusCode: 404, message: "Plugin not found" });

  if (plugin.publishedBy !== user.id) {
    throw createError({
      statusCode: 403,
      message: "Only the original publisher can delete this plugin.",
    });
  }

  if (body?.version) {
    // delete specific version
    const versionEntry = db
      .select()
      .from(schema.pluginVersions)
      .where(
        and(
          eq(schema.pluginVersions.pluginName, name),
          eq(schema.pluginVersions.version, body.version),
        ),
      )
      .get();

    if (!versionEntry) {
      throw createError({ statusCode: 404, message: `Version ${body.version} not found.` });
    }

    const allVersions = db
      .select()
      .from(schema.pluginVersions)
      .where(eq(schema.pluginVersions.pluginName, name))
      .all();

    if (allVersions.length <= 1) {
      throw createError({
        statusCode: 400,
        message: "Cannot delete the only version. Delete the entire plugin instead.",
      });
    }

    db.delete(schema.pluginVersions)
      .where(
        and(
          eq(schema.pluginVersions.pluginName, name),
          eq(schema.pluginVersions.version, body.version),
        ),
      )
      .run();

    const zipPath = join(process.cwd(), "data", "artifacts", name, `${body.version}.zip`);
    if (existsSync(zipPath)) rmSync(zipPath);

    // if deleted version was latest, update to next newest
    if (plugin.latestVersion === body.version) {
      const remaining = db
        .select()
        .from(schema.pluginVersions)
        .where(eq(schema.pluginVersions.pluginName, name))
        .all();
      const newest = remaining.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      if (newest) {
        db.update(schema.plugins)
          .set({ latestVersion: newest.version, updatedAt: new Date().toISOString() })
          .where(eq(schema.plugins.name, name))
          .run();
      }
    }

    return { status: "version_deleted", name, version: body.version };
  }

  // delete entire plugin
  db.delete(schema.pluginVersions).where(eq(schema.pluginVersions.pluginName, name)).run();
  db.delete(schema.plugins).where(eq(schema.plugins.name, name)).run();

  const artifactDir = join(process.cwd(), "data", "artifacts", name);
  if (existsSync(artifactDir)) rmSync(artifactDir, { recursive: true });

  return { status: "plugin_deleted", name };
});
