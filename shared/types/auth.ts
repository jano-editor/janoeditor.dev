export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

export interface SessionUser {
  id: number;
  login: string;
  name: string;
  avatarUrl: string;
  githubUrl: string;
}
