import { useDB, schema } from "~~/server/database";
import { desc } from "drizzle-orm";

export default defineEventHandler(async () => {
  const db = useDB();
  const allPlugins = db
    .select()
    .from(schema.plugins)
    .orderBy(desc(schema.plugins.totalDownloads))
    .all();

  // the list never shows READMEs, the detail endpoint serves them rendered
  return allPlugins.map(({ readme: _readme, ...p }) => ({
    ...p,
    extensions: JSON.parse(p.extensions) as string[],
  }));
});
