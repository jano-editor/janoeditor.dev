import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

export interface SecurityIssue {
  file: string;
  line: number;
  rule: string;
  severity: "critical" | "warning";
  message: string;
}

interface Rule {
  id: string;
  severity: "critical" | "warning";
  message: string;
  pattern: RegExp;
}

const rules: Rule[] = [
  // critical: shell execution
  {
    id: "no-exec",
    severity: "critical",
    message: "Shell execution detected (child_process)",
    pattern: /\b(exec|execSync|spawn|spawnSync|execFile|execFileSync|fork)\s*\(/g,
  },
  {
    id: "no-child-process",
    severity: "critical",
    message: "Importing child_process is not allowed",
    pattern: /['"]child_process['"]/g,
  },
  // critical: eval / dynamic code
  {
    id: "no-eval",
    severity: "critical",
    message: "Dynamic code execution (eval/Function) detected",
    pattern: /\b(eval)\s*\(|new\s+Function\s*\(/g,
  },
  // critical: file system destructive ops
  {
    id: "no-fs-delete",
    severity: "critical",
    message: "Destructive file system operation detected",
    pattern: /\b(rmSync|rm|unlinkSync|unlink|rmdirSync|rmdir)\s*\(/g,
  },
  {
    id: "no-fs-write",
    severity: "warning",
    message: "File system write detected - plugins should not write files",
    pattern: /\b(writeFileSync|writeFile|appendFileSync|appendFile|createWriteStream)\s*\(/g,
  },
  {
    id: "no-fs-import",
    severity: "warning",
    message: "Importing fs module - plugins should not access the file system",
    pattern: /['"](?:node:)?fs['"]/g,
  },
  // critical: network access
  {
    id: "no-network",
    severity: "critical",
    message: "Network access detected - plugins must not make external requests",
    pattern: /\b(fetch)\s*\(|['"](?:node:)?(?:http|https|net|dgram|tls)['"]/g,
  },
  // critical: process manipulation
  {
    id: "no-process-exit",
    severity: "critical",
    message: "process.exit is not allowed in plugins",
    pattern: /process\s*\.\s*exit\s*\(/g,
  },
  {
    id: "no-process-env-write",
    severity: "warning",
    message: "Modifying environment variables",
    pattern: /process\s*\.\s*env\s*(\[|\.)\s*\w+\s*=/g,
  },
  // warning: dynamic require/import
  {
    id: "no-dynamic-import",
    severity: "warning",
    message: "Dynamic import/require detected",
    pattern: /\brequire\s*\((?!['"]@jano-editor)/g,
  },
  // critical: reading sensitive files
  {
    id: "no-sensitive-paths",
    severity: "critical",
    message: "Accessing sensitive paths (ssh keys, credentials, etc.)",
    pattern:
      /['"](\/etc\/passwd|\/etc\/shadow|~?\/?\.ssh|~?\/?\.aws|~?\/?\.env|\.npmrc|\.gitconfig)['"]/g,
  },
];

function collectFiles(dir: string, base: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(full, base));
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".js")) {
      files.push(relative(base, full));
    }
  }
  return files;
}

export function scanPlugin(pluginDir: string): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  const files = collectFiles(pluginDir, pluginDir);

  for (const file of files) {
    const content = readFileSync(join(pluginDir, file), "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      // skip comments
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;

      for (const rule of rules) {
        rule.pattern.lastIndex = 0;
        if (rule.pattern.test(line)) {
          issues.push({
            file,
            line: i + 1,
            rule: rule.id,
            severity: rule.severity,
            message: rule.message,
          });
        }
      }
    }
  }

  return issues;
}

export function formatIssues(issues: SecurityIssue[]): string {
  const critical = issues.filter((i) => i.severity === "critical");
  const warnings = issues.filter((i) => i.severity === "warning");

  const parts: string[] = [];
  for (const issue of [...critical, ...warnings]) {
    parts.push(
      `${issue.severity === "critical" ? "✗" : "⚠"} ${issue.file}:${issue.line} — ${issue.message}`,
    );
  }
  return parts.join("\n");
}

export function hasCritical(issues: SecurityIssue[]): boolean {
  return issues.some((i) => i.severity === "critical");
}
