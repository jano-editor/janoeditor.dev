import { createHmac, timingSafeEqual } from "node:crypto";
import MarkdownIt from "markdown-it";
import { createHighlighter, type Highlighter } from "shiki";

// Plugin READMEs are written by anyone who publishes a plugin, so they are untrusted.
// They are rendered here on the server: raw HTML is dropped, links are limited to http(s)
// and mailto, and every image goes through our own proxy (/api/readme-image) with a signed
// URL, so visitors never talk to third-party servers and the proxy can't be used for anything
// we didn't render ourselves.

const LANGS = [
  "ts",
  "js",
  "json",
  "jsonc",
  "bash",
  "shell",
  "yaml",
  "toml",
  "python",
  "markdown",
  "dockerfile",
  "ini",
  "diff",
  "makefile",
] as const;

let highlighter: Promise<Highlighter> | null = null;

function getHighlighter() {
  highlighter ??= createHighlighter({ themes: ["one-dark-pro"], langs: [...LANGS] });
  return highlighter;
}

function secret(): string {
  const session = useRuntimeConfig().session as { password?: string } | undefined;
  const value = session?.password || process.env.NUXT_SESSION_PASSWORD;
  if (!value) throw new Error("NUXT_SESSION_PASSWORD is not set, image URLs can't be signed");
  return value;
}

export function signImageUrl(url: string): string {
  return createHmac("sha256", secret()).update(url).digest("hex").slice(0, 32);
}

export function verifyImageUrl(url: string, signature: string): boolean {
  const expected = Buffer.from(signImageUrl(url));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** "https://github.com/owner/repo" → "owner/repo", null for anything else. */
function repoPath(repoUrl: string): string | null {
  const match = /^https:\/\/github\.com\/([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/.exec(repoUrl);
  return match?.[1] ?? null;
}

/** Resolves a README link or image against the repository, null if it isn't allowed. */
function resolve(href: string, base: string | null): URL | null {
  try {
    const url = base ? new URL(href, base) : new URL(href);
    return ["https:", "http:", "mailto:"].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function renderReadme(markdown: string, repoUrl: string): Promise<string> {
  const shiki = await getHighlighter();
  const repo = repoPath(repoUrl);
  // relative links point into the repo, relative images to its raw files
  const linkBase = repo ? `https://github.com/${repo}/blob/HEAD/` : null;
  const imageBase = repo ? `https://raw.githubusercontent.com/${repo}/HEAD/` : null;

  const md = new MarkdownIt({
    // html is parsed (not escaped), so the two rules below can drop it completely
    html: true,
    linkify: true,
    highlight(code, lang) {
      const known = (LANGS as readonly string[]).includes(lang) ? lang : "text";
      return shiki.codeToHtml(code, { lang: known, theme: "one-dark-pro" });
    },
  });

  // HTML in a README (centered logos and the like) is left out, not shown as escaped text
  md.renderer.rules.html_block = () => "";
  md.renderer.rules.html_inline = () => "";

  md.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
    const token = tokens[idx]!;
    const href = token.attrGet("href") ?? "";
    if (href.startsWith("#")) return self.renderToken(tokens, idx, options);
    const url = resolve(href, linkBase);
    if (!url) {
      token.attrSet("href", "#");
    } else {
      token.attrSet("href", url.href);
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noopener nofollow ugc");
    }
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.image = (tokens, idx) => {
    const token = tokens[idx]!;
    const alt = escapeHtml(token.content);
    const url = resolve(token.attrGet("src") ?? "", imageBase);
    if (!url || url.protocol === "mailto:") return alt;
    const src = `/api/readme-image?url=${encodeURIComponent(url.href)}&sig=${signImageUrl(url.href)}`;
    return `<img src="${escapeHtml(src)}" alt="${alt}" loading="lazy" decoding="async">`;
  };

  return md.render(markdown);
}

// rendered READMEs, per plugin version
const cache = new Map<string, string>();
const CACHE_SIZE = 200;

export async function cachedReadme(
  key: string,
  markdown: string,
  repoUrl: string,
): Promise<string> {
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const html = await renderReadme(markdown, repoUrl);
  if (cache.size >= CACHE_SIZE) cache.delete(cache.keys().next().value!);
  cache.set(key, html);
  return html;
}
