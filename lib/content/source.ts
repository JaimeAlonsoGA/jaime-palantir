import { AsyncLocalStorage } from "node:async_hooks";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// Where the portfolio files live. Pages always read the deployed files on disk.
// The API reads and writes through `source()`: on disk locally, and in production straight
// to the GitHub repo, where every write is one commit that Vercel deploys.

export type Change = { path: string; text?: string; base64?: string; remove?: true };

export interface Source {
  readonly kind: "disk" | "github";
  read(file: string): Promise<string>;
  commit(changes: Change[], message: string): Promise<void>;
  /** The commit a write produced, when the source makes commits. */
  readonly lastCommit?: string;
}

export class MissingFile extends Error {}

export function contentRoot() {
  return process.env.CONTENT_ROOT ?? path.join(process.cwd(), "content");
}

export function publicRoot() {
  return process.env.PUBLIC_ROOT ?? path.join(process.cwd(), "public");
}

/** Repo-relative path ("content/…", "public/…") to a file on this machine. */
function onDisk(file: string) {
  if (file.startsWith("content/")) return path.join(contentRoot(), file.slice("content/".length));
  if (file.startsWith("public/")) return path.join(publicRoot(), file.slice("public/".length));
  throw new Error(`Outside the portfolio: ${file}`);
}

export const disk: Source = {
  kind: "disk",
  async read(file) {
    try {
      return await readFile(onDisk(file), "utf8");
    } catch (reason) {
      if ((reason as NodeJS.ErrnoException).code === "ENOENT") throw new MissingFile(file);
      throw reason;
    }
  },
  async commit(changes) {
    for (const change of changes) {
      const target = onDisk(change.path);
      if (change.remove) {
        await rm(target, { force: true });
        continue;
      }
      await mkdir(path.dirname(target), { recursive: true });
      const temporary = `${target}.${process.pid}.tmp`;
      await writeFile(temporary, change.base64 ? Buffer.from(change.base64, "base64") : (change.text ?? ""));
      await rename(temporary, target);
    }
  },
};

class GitHub implements Source {
  readonly kind = "github";
  lastCommit?: string;
  private head?: Promise<string>;

  constructor(
    private readonly repo: string,
    private readonly branch: string,
    private readonly token: string,
  ) {}

  private async call(route: string, init: RequestInit = {}) {
    const response = await fetch(`https://api.github.com/repos/${this.repo}${route}`, {
      ...init,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
    return response;
  }

  private async json(route: string, init: RequestInit = {}) {
    const response = await this.call(route, init);
    if (!response.ok) throw new Error(`GitHub ${init.method ?? "GET"} ${route}: ${response.status} ${await response.text()}`);
    return response.json();
  }

  /** One request reads one commit, so a write never mixes two versions of the portfolio. */
  private headSha() {
    this.head ??= this.json(`/git/ref/heads/${this.branch}`).then((ref: { object: { sha: string } }) => ref.object.sha);
    return this.head;
  }

  async read(file: string) {
    const sha = await this.headSha();
    const response = await this.call(`/contents/${file}?ref=${sha}`, { headers: { Accept: "application/vnd.github.raw" } });
    if (response.status === 404) throw new MissingFile(file);
    if (!response.ok) throw new Error(`GitHub read ${file}: ${response.status}`);
    return response.text();
  }

  async commit(changes: Change[], message: string) {
    if (changes.length === 0) return;
    const parent = await this.headSha();
    const base = await this.json(`/git/commits/${parent}`);
    const tree = await Promise.all(
      changes.map(async (change) => {
        const entry = { path: change.path, mode: "100644", type: "blob" };
        if (change.remove) return { ...entry, sha: null };
        if (change.base64) {
          const blob = await this.json(`/git/blobs`, {
            method: "POST",
            body: JSON.stringify({ content: change.base64, encoding: "base64" }),
          });
          return { ...entry, sha: blob.sha };
        }
        return { ...entry, content: change.text ?? "" };
      }),
    );
    const nextTree = await this.json(`/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: base.tree.sha, tree }),
    });
    const commit = await this.json(`/git/commits`, {
      method: "POST",
      body: JSON.stringify({ message, tree: nextTree.sha, parents: [parent] }),
    });
    const moved = await this.call(`/git/refs/heads/${this.branch}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });
    if (moved.status === 422) throw new StaleWrite();
    if (!moved.ok) throw new Error(`GitHub update ${this.branch}: ${moved.status} ${await moved.text()}`);
    this.lastCommit = commit.sha;
    this.head = Promise.resolve(commit.sha);
  }
}

/** Someone else committed between this request's read and its write. Nothing was written. */
export class StaleWrite extends Error {}

/** The source for API requests: GitHub when it is configured, otherwise the disk. */
export function apiSource(): Source {
  const token = process.env.PORTFOLIO_GITHUB_TOKEN;
  const repo = process.env.PORTFOLIO_GITHUB_REPO;
  if (!token || !repo) return disk;
  return new GitHub(repo, process.env.PORTFOLIO_GITHUB_BRANCH ?? "main", token);
}

const scope = new AsyncLocalStorage<Source>();

/** Run `task` with `source` as the portfolio's storage. */
export function withSource<T>(source: Source, task: () => Promise<T>) {
  return scope.run(source, task);
}

/** Storage for the current request; pages and tests get the disk. */
export function source(): Source {
  return scope.getStore() ?? disk;
}
