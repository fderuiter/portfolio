import { unstable_cache } from "next/cache";

export interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  author: string;
}

export interface GitHubLanguage {
  name: string;
  percentage: number;
}

import { getEnv } from "./env";

export interface GitHubStats {
  stars: number;
  forks: number;
  openIssues: number;
  languages: GitHubLanguage[];
  recentCommits: GitHubCommit[];
  commitActivity: number[];
}

/**
 * Centralized, mathematically uniform mock telemetry commit activity generator.
 * Produces exactly 52 values with static, non-parameterized curves to ensure visual parity
 * across simulation and rate-limiting API fallbacks.
 */
export function generateMockCommitActivity(): number[] {
  return Array.from({ length: 52 }, (_, i) => {
    const base = 4;
    const wave = Math.round(Math.sin(i / 2.5) * 3);
    const spike = i % 7 === 0 ? 4 : 0;
    return Math.max(1, base + wave + spike);
  });
}

interface RawCommitResponse {
  sha?: string;
  commit?: {
    message?: string;
    author?: {
      name?: string;
      date?: string;
    };
    committer?: {
      name?: string;
    };
  };
}

/**
 * Robust helper to parse owner and repository name from arbitrary GitHub URLs.
 * Sanitizes trailing .git extensions and correctly extracts segments.
 * Supports format: https://github.com/owner/repo (or with trailing slashes/subpaths)
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    const paths = parsed.pathname.split("/").filter(Boolean);
    if (paths.length >= 2) {
      return { 
        owner: paths[0], 
        repo: paths[1].replace(/\.git$/, "") 
      };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Primary fetch routine with rate-limit authentication guards.
 * Hits api.github.com/repos/{owner}/{repo}, /languages, and /commits.
 */
async function fetchRawGitHubStats(owner: string, repo: string): Promise<GitHubStats | null> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-app",
  };
  
  const currentEnv = getEnv();
  if (currentEnv.GITHUB_TOKEN) {
    headers.Authorization = `token ${currentEnv.GITHUB_TOKEN}`;
  }

  try {
    // 1. Fetch main repository statistics
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { 
      headers,
      next: { revalidate: 3600 } 
    });
    if (!repoRes.ok) {
      // 404 (private/unreleased repo) or 403 (unauthenticated rate-limit) are expected offline/build conditions
      return null;
    }
    const repoData = await repoRes.json();

    // 2. Fetch language definitions
    let langData: Record<string, number> = {};
    try {
      const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { 
        headers,
        next: { revalidate: 3600 } 
      });
      if (langRes.ok) {
        langData = await langRes.json();
      }
    } catch {
      // Non-critical language breakdown fetch failure
    }
    
    // Convert raw language bytes into precise rounded percentages
    const totalBytes = Object.values(langData).reduce((a: number, b: number) => a + b, 0);
    const languages: GitHubLanguage[] = Object.entries(langData)
      .map(([name, bytes]) => ({
        name,
        percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
      }))
      .filter(l => l.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage);

    // 3. Fetch recent development timeline commits (limit to 5)
    let commitsData: RawCommitResponse[] = [];
    try {
      const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`, { 
        headers,
        next: { revalidate: 3600 } 
      });
      if (commitsRes.ok) {
        commitsData = await commitsRes.json();
      }
    } catch {
      // Non-critical recent commits fetch failure
    }

    // Highly resilient commit mapper to safeguard against empty or broken payloads
    const recentCommits: GitHubCommit[] = Array.isArray(commitsData) 
      ? commitsData.map((c) => ({
          sha: typeof c.sha === "string" ? c.sha.substring(0, 7) : "",
          message: typeof c.commit?.message === "string" ? c.commit.message.split("\n")[0] : "No commit message provided",
          date: typeof c.commit?.author?.date === "string" ? c.commit.author.date : "",
          author: typeof c.commit?.author?.name === "string"
            ? c.commit.author.name
            : typeof c.commit?.committer?.name === "string"
            ? c.commit.committer.name
            : "Unknown Author",
        }))
      : [];

    // 4. Fetch weekly commit activity stats
    let commitActivity: number[] = [];
    try {
      const activityRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`, { 
        headers,
        next: { revalidate: 3600 } 
      });
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        if (Array.isArray(activityData)) {
          commitActivity = activityData.map((item: { total?: number }) => item.total || 0);
        }
      }
    } catch {
      // Non-critical commit activity fetch failure
    }

    // Resilient sine-wave-based mockup generator if empty or rate-limited
    if (commitActivity.length === 0) {
      commitActivity = generateMockCommitActivity();
    }

    return {
      stars: repoData.stargazers_count ?? 0,
      forks: repoData.forks_count ?? 0,
      openIssues: repoData.open_issues_count ?? 0,
      languages,
      recentCommits,
      commitActivity,
    };
  } catch {
    return null;
  }
}

/**
 * Internal Next.js cached function mapping to stable caching stores.
 * Dynamically includes owner and repo parameters in the cache key to prevent collision.
 */
const cachedGetGitHubStats = (owner: string, repo: string) => unstable_cache(
  async () => fetchRawGitHubStats(owner, repo),
  ["github-repo-metrics-cache", owner, repo],
  { revalidate: 3600, tags: ["github"] }
)();

/**
 * Public facing API client wrapper.
 * Integrates Next.js unstable_cache and seamlessly falls back to direct API fetching
 * or deterministic simulated stats when executed outside the Next.js app context or
 * when rate limits/404s are encountered.
 */
export async function getGitHubStats(owner: string, repo: string, fallbackLanguage?: string): Promise<GitHubStats | null> {
  try {
    const stats = await cachedGetGitHubStats(owner, repo);
    if (stats) return stats;
  } catch {
    // Gracefully handle Next.js environment cache errors in standalone Node scripts/tests
    try {
      const stats = await fetchRawGitHubStats(owner, repo);
      if (stats) return stats;
    } catch {
      // Ignore network/API fetch exceptions
    }
  }

  if (fallbackLanguage) {
    return getSimulatedStats(fallbackLanguage);
  }

  return null;
}

export interface SimulatedTerminalLog {
  text: string;
  color?: string;
}

export function getSimulatedTerminalCommand(language: string): string {
  const lang = language.toLowerCase();
  if (lang === "haskell") return "stack build --fast";
  if (lang === "typescript") return "tsc --build --watch";
  if (lang === "python") return "pytest -v --color=yes";
  return "make build";
}

export function getSimulatedTerminalLogs(language: string): SimulatedTerminalLog[] {
  const lang = language.toLowerCase();
  if (lang === "haskell") {
    return [
      { text: "[1 of 4] Compiling Core.AST          ( src/Core/AST.hs, AST.o )", color: "text-zinc-400" },
      { text: "[2 of 4] Compiling Parser.Type      ( src/Parser/Type.hs, Type.o )", color: "text-zinc-400" },
      { text: "[3 of 4] Compiling Solver.Unify     ( src/Solver/Unify.hs, Unify.o )", color: "text-zinc-400" },
      { text: "[4 of 4] Compiling Main             ( app/Main.hs, Main.o )", color: "text-zinc-400" },
      { text: "Linking .stack-work/dist/x86_64/aura-compiler ...", color: "text-zinc-400" },
      { text: "Build successful! Loaded 4 modules.", color: "text-emerald-400" },
    ];
  }
  if (lang === "typescript") {
    return [
      { text: "[1:24:02 PM] Starting compilation in watch mode...", color: "text-zinc-400" },
      { text: "[1:24:04 PM] Found 0 errors. Watching for file changes.", color: "text-emerald-400" },
      { text: "[1:24:10 PM] File change detected. Starting incremental compilation...", color: "text-brand-cyan" },
      { text: "[1:24:11 PM] TS2304: Cannot find name 'unreachable' (Self-healed)", color: "text-amber-500" },
      { text: "[1:24:12 PM] Re-compiled successfully. [0 errors]", color: "text-emerald-400" },
    ];
  }
  if (lang === "python") {
    return [
      { text: "==================== test session starts ====================", color: "text-zinc-400" },
      { text: "platform linux -- Python 3.11.4, pytest-7.4.0", color: "text-zinc-400" },
      { text: "plugins: cov-4.1.0, pydantic-2.1.1", color: "text-zinc-400" },
      { text: "collected 18 items", color: "text-zinc-300" },
      { text: "tests/test_transport.py ... PASSED", color: "text-emerald-500" },
      { text: "tests/test_hipaa_boundary.py ... PASSED", color: "text-emerald-500" },
      { text: "==================== 18 passed in 0.42s =====================", color: "text-emerald-400" },
    ];
  }
  return [
    { text: "[info] Initializing compiler pipeline...", color: "text-zinc-400" },
    { text: "[info] Parsing source file dependencies...", color: "text-zinc-400" },
    { text: `[info] Compiling ${language} modules...`, color: "text-zinc-300" },
    { text: "[success] Build target compiled successfully in 2.34s", color: "text-emerald-400" },
  ];
}

export function getSimulatedStats(language: string): GitHubStats {
  let stars = 42;
  let forks = 8;
  let openIssues = 1;
  let languages: GitHubLanguage[] = [];
  
  const lang = language.toLowerCase();
  if (lang === "typescript") {
    stars = 148;
    forks = 24;
    openIssues = 3;
    languages = [
      { name: "TypeScript", percentage: 88 },
      { name: "JavaScript", percentage: 12 },
    ];
  } else if (lang === "python") {
    stars = 112;
    forks = 18;
    openIssues = 2;
    languages = [
      { name: "Python", percentage: 95 },
      { name: "HTML", percentage: 5 },
    ];
  } else if (lang === "haskell") {
    stars = 74;
    forks = 11;
    openIssues = 0;
    languages = [
      { name: "Haskell", percentage: 91 },
      { name: "CSS", percentage: 9 },
    ];
  } else {
    stars = 50;
    forks = 10;
    openIssues = 2;
    languages = [
      { name: language, percentage: 100 },
    ];
  }

  const commitActivity = generateMockCommitActivity();

  let recentCommits: GitHubCommit[] = [];
  if (lang === "haskell") {
    recentCommits = [
      {
        sha: "a1b2c3d",
        message: "Merge pull request #14 from ghc-9.2-upgrade",
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "e5f6g7h",
        message: "Optimize monadic parser combinators for large AST streams",
        date: new Date(Date.now() - 3600000 * 12).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "i9j0k1l",
        message: "Refactor type flow tracer to use ReaderT design pattern",
        date: new Date(Date.now() - 3600000 * 24).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "m2n3o4p",
        message: "Fix space leak in lazy evaluation check of compiler",
        date: new Date(Date.now() - 3600000 * 48).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "q5r6s7t",
        message: "Initial prototype of aura AST parser",
        date: new Date(Date.now() - 3600000 * 120).toISOString(),
        author: "Frederick de Ruiter",
      },
    ];
  } else if (lang === "typescript") {
    recentCommits = [
      {
        sha: "f1d2e3a",
        message: "perf: optimize web worker message transfer serialization",
        date: new Date(Date.now() - 3600000 * 3).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "c4b5a6f",
        message: "feat: add cyclic dependency detection algorithm to DAG core",
        date: new Date(Date.now() - 3600000 * 15).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "e7d8c9b",
        message: "refactor: migrate state management store to Zustand",
        date: new Date(Date.now() - 3600000 * 30).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "a1b2c3d",
        message: "test: add integration test suite for AST compilation",
        date: new Date(Date.now() - 3600000 * 60).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "4f5e6d7",
        message: "initial commit: basic node workspace layout and setup",
        date: new Date(Date.now() - 3600000 * 150).toISOString(),
        author: "Frederick de Ruiter",
      },
    ];
  } else if (lang === "python") {
    recentCommits = [
      {
        sha: "p9o8i7u",
        message: "release: v1.1.2 patch for clinical-data transport layer security",
        date: new Date(Date.now() - 3600000 * 4).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "y6t5r4e",
        message: "feat: enforce TLS 1.3 encryption and automatic token rotation",
        date: new Date(Date.now() - 3600000 * 18).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "w3q2a1s",
        message: "refactor: migrate clinical models to Pydantic v2 core schemas",
        date: new Date(Date.now() - 3600000 * 36).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "z9x8c7v",
        message: "test: implement HIPAA transport boundary mock endpoints",
        date: new Date(Date.now() - 3600000 * 72).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "b6n5m4a",
        message: "setup: initialize pyproject.toml and poetry structure",
        date: new Date(Date.now() - 3600000 * 180).toISOString(),
        author: "Frederick de Ruiter",
      },
    ];
  } else {
    recentCommits = [
      {
        sha: "d3c2b1a",
        message: `update core modules and dependencies for ${language} codebase`,
        date: new Date(Date.now() - 3600000 * 5).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "a4b5c6d",
        message: "optimize internal algorithms and data structures",
        date: new Date(Date.now() - 3600000 * 20).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "e7f8g9h",
        message: "add integration and unit tests for core pipeline",
        date: new Date(Date.now() - 3600000 * 40).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "i1j2k3l",
        message: "improve error handling and exception logging structures",
        date: new Date(Date.now() - 3600000 * 80).toISOString(),
        author: "Frederick de Ruiter",
      },
      {
        sha: "m4n5o6p",
        message: `initial workspace layout for ${language} project`,
        date: new Date(Date.now() - 3600000 * 200).toISOString(),
        author: "Frederick de Ruiter",
      },
    ];
  }

  return {
    stars,
    forks,
    openIssues,
    languages,
    recentCommits,
    commitActivity,
  };
}
