import { useDB, schema } from "~~/server/database";
import { eq } from "drizzle-orm";
import { parseRepoUrl, fetchRepoFile, repoExists } from "~~/server/utils/github";
import { validateManifest, compareVersions } from "~~/server/utils/validate-plugin";

export default defineEventHandler(async (event) => {
  // require auth
  const session = await requireUserSession(event);
  const user = session.user as { id: number; login: string };

  // read body
  const body = await readBody<{ repoUrl: string }>(event);
  if (!body?.repoUrl) {
    throw createError({ statusCode: 400, message: "repoUrl is required" });
  }

  // parse repo
  const repo = parseRepoUrl(body.repoUrl);
  if (!repo) {
    throw createError({
      statusCode: 400,
      message: "Invalid GitHub repository URL. Use 'owner/repo' format.",
    });
  }

  // check repo exists
  const exists = await repoExists(repo);
  if (!exists) {
    throw createError({
      statusCode: 404,
      message: `Repository '${repo}' not found or not public.`,
    });
  }

  // fetch plugin.json
  const pluginJsonRaw = await fetchRepoFile(repo, "plugin.json");
  if (!pluginJsonRaw) {
    throw createError({ statusCode: 400, message: "plugin.json not found in repository root." });
  }

  let pluginJsonParsed: unknown;
  try {
    pluginJsonParsed = JSON.parse(pluginJsonRaw);
  } catch {
    throw createError({ statusCode: 400, message: "plugin.json is not valid JSON." });
  }

  // validate manifest
  const { manifest, errors } = validateManifest(pluginJsonParsed);
  if (!manifest || errors.length > 0) {
    throw createError({ statusCode: 400, message: `Validation failed: ${errors.join(", ")}` });
  }

  // fetch package.json to cross-check version
  const packageJsonRaw = await fetchRepoFile(repo, "package.json");
  if (packageJsonRaw) {
    try {
      const pkg = JSON.parse(packageJsonRaw);
      if (pkg.version && pkg.version !== manifest.version) {
        throw createError({
          statusCode: 400,
          message: `Version mismatch: plugin.json says ${manifest.version}, package.json says ${pkg.version}`,
        });
      }
    } catch (e) {
      if (e && typeof e === "object" && "statusCode" in e) throw e;
      // ignore parse errors for package.json
    }
  }

  // fetch README
  const readme = await fetchRepoFile(repo, "README.md");

  // check existing plugin
  const db = useDB();
  const existing = db
    .select()
    .from(schema.plugins)
    .where(eq(schema.plugins.name, manifest.name))
    .get();

  if (existing) {
    // check ownership
    if (existing.publishedBy !== user.id) {
      throw createError({
        statusCode: 403,
        message: `Plugin '${manifest.name}' is owned by @${existing.publishedByLogin}. Only the original publisher can update.`,
      });
    }

    // check version is higher
    if (compareVersions(manifest.version, existing.version) <= 0) {
      throw createError({
        statusCode: 400,
        message: `Version ${manifest.version} is not higher than current ${existing.version}.`,
      });
    }

    // check extension conflicts with OTHER plugins
    const allPlugins = db.select().from(schema.plugins).all();
    for (const other of allPlugins) {
      if (other.name === manifest.name) continue;
      const otherExts = JSON.parse(other.extensions) as string[];
      const conflicts = manifest.extensions.filter((e) => otherExts.includes(e));
      if (conflicts.length > 0) {
        throw createError({
          statusCode: 409,
          message: `Extension conflict: ${conflicts.join(", ")} already claimed by '${other.name}'.`,
        });
      }
    }

    // update
    const now = new Date().toISOString();
    db.update(schema.plugins)
      .set({
        version: manifest.version,
        apiVersion: manifest.api,
        description: manifest.description,
        extensions: JSON.stringify(manifest.extensions),
        author: manifest.author || user.login,
        license: manifest.license,
        homepage: manifest.homepage,
        repoUrl: `https://github.com/${repo}`,
        readme: readme || existing.readme,
        updatedAt: now,
      })
      .where(eq(schema.plugins.name, manifest.name))
      .run();

    return { status: "updated", name: manifest.name, version: manifest.version };
  }

  // check extension conflicts for new plugin
  const allPlugins = db.select().from(schema.plugins).all();
  for (const other of allPlugins) {
    const otherExts = JSON.parse(other.extensions) as string[];
    const conflicts = manifest.extensions.filter((e) => otherExts.includes(e));
    if (conflicts.length > 0) {
      throw createError({
        statusCode: 409,
        message: `Extension conflict: ${conflicts.join(", ")} already claimed by '${other.name}'.`,
      });
    }
  }

  // insert new
  const now = new Date().toISOString();
  db.insert(schema.plugins)
    .values({
      name: manifest.name,
      version: manifest.version,
      apiVersion: manifest.api,
      description: manifest.description,
      extensions: JSON.stringify(manifest.extensions),
      author: manifest.author || user.login,
      license: manifest.license,
      homepage: manifest.homepage,
      repoUrl: `https://github.com/${repo}`,
      readme: readme || null,
      publishedBy: user.id,
      publishedByLogin: user.login,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return { status: "published", name: manifest.name, version: manifest.version };
});
