export interface PluginManifest {
  name: string;
  version: string;
  api: number;
  description: string;
  extensions: string[];
  entry: string;
  author?: string;
  homepage?: string;
  license?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  manifest?: PluginManifest;
  readme?: string;
}

const CURRENT_API_VERSION = 1;

export function validateManifest(raw: unknown): {
  manifest: PluginManifest | null;
  errors: string[];
} {
  const errors: string[] = [];

  if (!raw || typeof raw !== "object") {
    return { manifest: null, errors: ["plugin.json is not a valid JSON object"] };
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.name !== "string" || !obj.name) errors.push("Missing or invalid 'name'");
  if (typeof obj.version !== "string" || !obj.version) errors.push("Missing or invalid 'version'");
  if (typeof obj.description !== "string") errors.push("Missing 'description'");
  if (!Array.isArray(obj.extensions) || obj.extensions.length === 0)
    errors.push("'extensions' must be a non-empty array");
  if (typeof obj.entry !== "string" || !obj.entry) errors.push("Missing or invalid 'entry'");

  // name convention
  if (typeof obj.name === "string" && !obj.name.startsWith("jano-plugin-")) {
    errors.push("Plugin name must start with 'jano-plugin-'");
  }

  // semver check
  if (typeof obj.version === "string" && !/^\d+\.\d+\.\d+(-.+)?$/.test(obj.version)) {
    errors.push("Version must be valid semver (e.g. 1.0.0)");
  }

  // API version check
  const api = typeof obj.api === "number" ? obj.api : 1;
  if (api > CURRENT_API_VERSION) {
    errors.push(`API version ${api} is not supported. Current: ${CURRENT_API_VERSION}`);
  }

  if (errors.length > 0) return { manifest: null, errors };

  return {
    manifest: {
      name: obj.name as string,
      version: obj.version as string,
      api,
      description: obj.description as string,
      extensions: obj.extensions as string[],
      entry: obj.entry as string,
      author: typeof obj.author === "string" ? obj.author : undefined,
      homepage: typeof obj.homepage === "string" ? obj.homepage : undefined,
      license: typeof obj.license === "string" ? obj.license : undefined,
    },
    errors: [],
  };
}

export function compareVersions(a: string, b: string): number {
  const pa = a.split(/[-.]/).map((p) => (Number.isNaN(Number(p)) ? p : Number(p)));
  const pb = b.split(/[-.]/).map((p) => (Number.isNaN(Number(p)) ? p : Number(p)));
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (typeof va === "number" && typeof vb === "number") {
      if (va > vb) return 1;
      if (va < vb) return -1;
    } else {
      const sa = String(va);
      const sb = String(vb);
      if (sa > sb) return 1;
      if (sa < sb) return -1;
    }
  }
  return 0;
}
