import type { GitHubUser, SessionUser } from "~~/shared/types/auth";

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: false,
  },
  async onSuccess(event, { user: githubUser }) {
    const gh = githubUser as GitHubUser;

    const sessionUser: SessionUser = {
      id: gh.id,
      login: gh.login,
      name: gh.name || gh.login,
      avatarUrl: gh.avatar_url,
      githubUrl: gh.html_url,
    };

    await setUserSession(event, {
      user: sessionUser,
    });

    return sendRedirect(event, "/plugins");
  },
  onError(event, error) {
    console.error("GitHub OAuth error:", error);
    return sendRedirect(event, "/plugins?auth_error=1");
  },
});
