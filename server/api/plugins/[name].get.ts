import { useDB, schema } from "~~/server/database";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, "name");
  if (!name) throw createError({ statusCode: 400, message: "Plugin name required" });

  const db = useDB();
  const plugin = db.select().from(schema.plugins).where(eq(schema.plugins.name, name)).get();

  if (!plugin) throw createError({ statusCode: 404, message: "Plugin not found" });

  return {
    ...plugin,
    extensions: JSON.parse(plugin.extensions),
  };
});
