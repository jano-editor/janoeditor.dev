import { useDB, schema } from "~~/server/database";
import { eq } from "drizzle-orm";
import { parseRepoUrl, fetchRepoFile, repoExists } from "~~/server/utils/github";
import { validateManifest, compareVersions } from "~~/server/utils/validate-plugin";
import { execSync } from "node:child_process";
import { mkdirSync, existsSync, rmSync, createWriteStream } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import archiver from "archiver";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const user = session.user as { id: number; login: string };

  const body = await readBody<{ repoUrl: string }>(event);
  if (!body?.repoUrl) {
    throw createError({ statusCode: 400, message: "repoUrl is required" });
  }

  // SSE setup
  setResponseHeader(event, "Content-Type", "text/event-stream");
  setResponseHeader(event, "Cache-Control", "no-cache");
  setResponseHeader(event, "Connection", "keep-alive");

  const res = event.node.res;

  function sendStep(step: string, status: "running" | "done" | "error", message?: string) {
    const data = JSON.stringify({ step, status, message });
    res.write(`data: ${data}\n\n`);
  }

  function sendComplete(result: { status: string; name: string; version: string }) {
    const data = JSON.stringify({ step: "complete", status: "done", result });
    res.write(`data: ${data}\n\n`);
    res.end();
  }

  function sendError(step: string, message: string) {
    sendStep(step, "error", message);
    res.end();
  }

  try {
    // Step 1: Validate repo URL
    sendStep("validate-url", "running");
    const repo = parseRepoUrl(body.repoUrl);
    if (!repo) {
      return sendError("validate-url", "Invalid GitHub repository URL. Use 'owner/repo' format.");
    }
    sendStep("validate-url", "done", repo);

    // Step 2: Check repo exists
    sendStep("check-repo", "running");
    const exists = await repoExists(repo);
    if (!exists) {
      return sendError("check-repo", `Repository '${repo}' not found or not public.`);
    }
    sendStep("check-repo", "done");

    // Step 3: Fetch and validate plugin.json
    sendStep("fetch-manifest", "running");
    const pluginJsonRaw = await fetchRepoFile(repo, "plugin.json");
    if (!pluginJsonRaw) {
      return sendError("fetch-manifest", "plugin.json not found in repository root.");
    }

    let pluginJsonParsed: unknown;
    try {
      pluginJsonParsed = JSON.parse(pluginJsonRaw);
    } catch {
      return sendError("fetch-manifest", "plugin.json is not valid JSON.");
    }

    const { manifest, errors } = validateManifest(pluginJsonParsed);
    if (!manifest || errors.length > 0) {
      return sendError("fetch-manifest", `Validation failed: ${errors.join(", ")}`);
    }
    sendStep("fetch-manifest", "done", `${manifest.name} v${manifest.version}`);

    // Step 4: Check version
    sendStep("check-version", "running");
    const db = useDB();
    const existing = db
      .select()
      .from(schema.plugins)
      .where(eq(schema.plugins.name, manifest.name))
      .get();

    if (existing) {
      if (existing.publishedBy !== user.id) {
        return sendError(
          "check-version",
          `Plugin '${manifest.name}' is owned by @${existing.publishedByLogin}.`,
        );
      }
      if (compareVersions(manifest.version, existing.latestVersion) <= 0) {
        return sendError(
          "check-version",
          `Version ${manifest.version} is not higher than current ${existing.latestVersion}.`,
        );
      }
    }
    sendStep(
      "check-version",
      "done",
      existing ? `Updating from ${existing.latestVersion}` : "New plugin",
    );

    // Step 5: Check extension conflicts
    sendStep("check-conflicts", "running");
    const allPlugins = db.select().from(schema.plugins).all();
    for (const other of allPlugins) {
      if (other.name === manifest.name) continue;
      const otherExts = JSON.parse(other.extensions) as string[];
      const conflicts = manifest.extensions.filter((e) => otherExts.includes(e));
      if (conflicts.length > 0) {
        return sendError(
          "check-conflicts",
          `Extension conflict: ${conflicts.join(", ")} claimed by '${other.name}'.`,
        );
      }
    }
    sendStep("check-conflicts", "done");

    // Step 6: Clone repository
    sendStep("clone", "running");
    const tmpDir = join(tmpdir(), `jano-build-${Date.now()}`);
    try {
      execSync(`git clone --depth 1 https://github.com/${repo}.git "${tmpDir}"`, {
        stdio: "pipe",
        timeout: 30000,
      });
    } catch (err) {
      return sendError(
        "clone",
        `Failed to clone repository: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    sendStep("clone", "done");

    // Step 7: Build
    sendStep("build", "running");
    const entryFile = join(tmpDir, "src", "index.ts");
    const distDir = join(tmpDir, "dist");

    if (!existsSync(entryFile)) {
      rmSync(tmpDir, { recursive: true, force: true });
      return sendError("build", "src/index.ts not found in repository.");
    }

    try {
      mkdirSync(distDir, { recursive: true });
      // try esbuild first, fallback to simple copy if already built
      try {
        execSync(
          `npx --yes esbuild "${entryFile}" --bundle --format=esm --platform=node --outfile="${join(distDir, "index.js")}" --external:@jano-editor/*`,
          { stdio: "pipe", timeout: 30000, cwd: tmpDir },
        );
      } catch {
        // if esbuild fails, try if dist already exists in repo
        const repoDistFile = join(tmpDir, "dist", "index.js");
        if (!existsSync(repoDistFile)) {
          throw new Error("Build failed and no pre-built dist/index.js found.");
        }
      }
    } catch (err) {
      rmSync(tmpDir, { recursive: true, force: true });
      return sendError(
        "build",
        `Build failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    const builtFile = join(distDir, "index.js");
    if (!existsSync(builtFile)) {
      rmSync(tmpDir, { recursive: true, force: true });
      return sendError("build", "Build produced no output.");
    }
    sendStep("build", "done");

    // Step 8: Save artifact as ZIP
    sendStep("save", "running");
    const artifactDir = join(process.cwd(), "data", "artifacts", manifest.name);
    mkdirSync(artifactDir, { recursive: true });
    const zipPath = join(artifactDir, `${manifest.version}.zip`);

    await new Promise<void>((resolveZip, rejectZip) => {
      const output = createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });
      output.on("close", resolveZip);
      archive.on("error", rejectZip);
      archive.pipe(output);
      archive.file(builtFile, { name: "index.js" });
      archive.file(join(tmpDir, "plugin.json"), { name: "plugin.json" });
      void archive.finalize();
    });

    // cleanup tmp
    rmSync(tmpDir, { recursive: true, force: true });
    sendStep("save", "done");

    // Step 9: Fetch README
    sendStep("readme", "running");
    const readme = await fetchRepoFile(repo, "README.md");
    sendStep("readme", "done");

    // Step 10: Save to DB
    sendStep("publish", "running");
    const now = new Date().toISOString();

    if (existing) {
      db.update(schema.plugins)
        .set({
          latestVersion: manifest.version,
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
    } else {
      db.insert(schema.plugins)
        .values({
          name: manifest.name,
          latestVersion: manifest.version,
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
    }

    // register this version
    db.insert(schema.pluginVersions)
      .values({
        pluginName: manifest.name,
        version: manifest.version,
        apiVersion: manifest.api,
        createdAt: now,
      })
      .run();

    sendStep("publish", "done");
    sendComplete({
      status: existing ? "updated" : "published",
      name: manifest.name,
      version: manifest.version,
    });
  } catch (err) {
    sendError("unknown", `Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
  }
});
