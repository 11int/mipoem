// Minimal GitHub Git Data API client used to persist submitted poems by
// committing markdown files to the repository. Vercel's runtime filesystem is
// read-only, so writes have to go to durable storage — here, the repo itself,
// which doubles as the source of truth for poems and triggers a redeploy.

const API = "https://api.github.com";

type GitHubConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
};

export type CommitFile = {
  /** Repo-relative path, e.g. "poems/my-poem.md". */
  path: string;
  /** UTF-8 file contents. */
  content: string;
};

export function getGitHubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  return {
    token,
    owner: process.env.GITHUB_OWNER || "11int",
    repo: process.env.GITHUB_REPO || "mipoem",
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

export function isGitHubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN);
}

function headers(cfg: GitHubConfig): HeadersInit {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "mipoem-app",
  };
}

async function gh<T>(
  cfg: GitHubConfig,
  pathName: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API}${pathName}`, {
    ...init,
    headers: { ...headers(cfg), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GitHub ${init?.method ?? "GET"} ${pathName} failed: ${res.status} ${detail}`);
  }
  return (await res.json()) as T;
}

/**
 * Returns the UTF-8 text of a file in the repo, or null if it does not exist.
 */
export async function getRepoFileText(filePath: string): Promise<string | null> {
  const cfg = getGitHubConfig();
  if (!cfg) return null;
  const url = `/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURIComponent(
    filePath
  ).replace(/%2F/g, "/")}?ref=${encodeURIComponent(cfg.branch)}`;

  const res = await fetch(`${API}${url}`, {
    headers: headers(cfg),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GitHub GET ${url} failed: ${res.status} ${detail}`);
  }
  const data = (await res.json()) as { content?: string; encoding?: string };
  if (!data.content) return "";
  return Buffer.from(data.content, "base64").toString("utf8");
}

/**
 * Commits one or more files to the configured branch in a single commit using
 * the Git Data API. Retries once on a fast-forward conflict (concurrent post).
 */
export async function commitFiles(
  files: CommitFile[],
  message: string
): Promise<void> {
  const cfg = getGitHubConfig();
  if (!cfg) throw new Error("GitHub storage is not configured.");

  const attempt = async (): Promise<boolean> => {
    // Current branch head + its tree.
    const ref = await gh<{ object: { sha: string } }>(
      cfg,
      `/repos/${cfg.owner}/${cfg.repo}/git/ref/heads/${cfg.branch}`
    );
    const headSha = ref.object.sha;
    const headCommit = await gh<{ tree: { sha: string } }>(
      cfg,
      `/repos/${cfg.owner}/${cfg.repo}/git/commits/${headSha}`
    );

    // Create a blob per file.
    const treeItems = await Promise.all(
      files.map(async (file) => {
        const blob = await gh<{ sha: string }>(
          cfg,
          `/repos/${cfg.owner}/${cfg.repo}/git/blobs`,
          {
            method: "POST",
            body: JSON.stringify({ content: file.content, encoding: "utf-8" }),
          }
        );
        return {
          path: file.path,
          mode: "100644",
          type: "blob",
          sha: blob.sha,
        };
      })
    );

    const tree = await gh<{ sha: string }>(
      cfg,
      `/repos/${cfg.owner}/${cfg.repo}/git/trees`,
      {
        method: "POST",
        body: JSON.stringify({ base_tree: headCommit.tree.sha, tree: treeItems }),
      }
    );

    const commit = await gh<{ sha: string }>(
      cfg,
      `/repos/${cfg.owner}/${cfg.repo}/git/commits`,
      {
        method: "POST",
        body: JSON.stringify({
          message,
          tree: tree.sha,
          parents: [headSha],
        }),
      }
    );

    // Fast-forward the branch ref. force:false so a concurrent commit fails
    // instead of being overwritten.
    const res = await fetch(
      `${API}/repos/${cfg.owner}/${cfg.repo}/git/refs/heads/${cfg.branch}`,
      {
        method: "PATCH",
        headers: headers(cfg),
        cache: "no-store",
        body: JSON.stringify({ sha: commit.sha, force: false }),
      }
    );
    if (res.status === 422) return false; // ref moved; retry
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`GitHub update ref failed: ${res.status} ${detail}`);
    }
    return true;
  };

  if (!(await attempt())) {
    if (!(await attempt())) {
      throw new Error("Could not commit poem after a concurrent update.");
    }
  }
}
