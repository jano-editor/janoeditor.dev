export interface RepoFile {
  name: string;
  content: string;
}

export async function fetchRepoFile(
  repo: string,
  path: string,
  token?: string,
): Promise<string | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3.raw",
    "User-Agent": "jano-editor",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const res = await fetch(url, { headers });

  if (!res.ok) return null;
  return res.text();
}

export async function repoExists(repo: string, token?: string): Promise<boolean> {
  const headers: Record<string, string> = {
    "User-Agent": "jano-editor",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `https://api.github.com/repos/${repo}`;
  const res = await fetch(url, { headers });
  return res.ok;
}

export function parseRepoUrl(input: string): string | null {
  // accept: "owner/repo", "https://github.com/owner/repo", "github.com/owner/repo"
  let repo = input.trim();

  // full URL
  const urlMatch = repo.match(/github\.com\/([^/]+\/[^/]+)/);
  if (urlMatch?.[1]) repo = urlMatch[1];

  // remove trailing .git
  repo = repo.replace(/\.git$/, "");

  // validate format
  if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) {
    return repo;
  }

  return null;
}
