import { verifyImageUrl } from "../utils/readme";

// Serves images from plugin READMEs, so visitors don't load them from third-party servers.
// Only URLs signed by renderReadme() are fetched, only over https from known image hosts,
// and the response is locked down so an SVG opened directly can't run scripts on our origin.

const ALLOWED_HOSTS = new Set([
  "raw.githubusercontent.com",
  "user-images.githubusercontent.com",
  "private-user-images.githubusercontent.com",
  "objects.githubusercontent.com",
  "camo.githubusercontent.com",
  "avatars.githubusercontent.com",
  "github.com",
  "img.shields.io",
  "badgen.net",
]);

const MAX_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 3;

function allowed(url: URL): boolean {
  return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname);
}

export default defineEventHandler(async (event) => {
  const { url: raw, sig } = getQuery(event);
  if (typeof raw !== "string" || typeof sig !== "string" || !verifyImageUrl(raw, sig)) {
    throw createError({ statusCode: 403, message: "Invalid image link" });
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw createError({ statusCode: 400, message: "Invalid image URL" });
  }

  // follow redirects by hand, every hop has to stay on an allowed host
  let res: Response | null = null;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!allowed(url)) throw createError({ statusCode: 403, message: "Image host not allowed" });
    res = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": "janoeditor.dev readme images" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }).catch(() => null);
    if (!res) throw createError({ statusCode: 502, message: "Image could not be loaded" });
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      url = new URL(location, url);
      continue;
    }
    break;
  }

  if (!res?.ok) throw createError({ statusCode: 502, message: "Image could not be loaded" });
  const type = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  if (!type.startsWith("image/")) {
    throw createError({ statusCode: 415, message: "Not an image" });
  }
  const length = Number(res.headers.get("content-length") ?? 0);
  if (length > MAX_BYTES) throw createError({ statusCode: 413, message: "Image too large" });

  const body = Buffer.from(await res.arrayBuffer());
  if (body.length > MAX_BYTES) throw createError({ statusCode: 413, message: "Image too large" });

  setResponseHeaders(event, {
    "Content-Type": type,
    "Cache-Control": "public, max-age=86400",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  });
  return body;
});
