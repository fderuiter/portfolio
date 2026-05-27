import { getGitHubStats, parseGitHubUrl } from "../lib/github";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
  const repo = "https://github.com/facebook/react";
  const parsed = parseGitHubUrl(repo);
  if (!parsed) {
    console.error("URL failed parsing");
    return;
  }
  
  console.log(`Querying stats for ${parsed.owner}/${parsed.repo}...`);
  try {
    const stats = await getGitHubStats(parsed.owner, parsed.repo);
    if (!stats) {
      console.log("Failed to load stats (returned null). This is expected if the API rate limit has been exceeded without a token.");
      return;
    }
    console.log("Stats Loaded Successfully:");
    console.log(`- Stars: ${stats.stars}, Forks: ${stats.forks}, Open Issues: ${stats.openIssues}`);
    console.log("- Languages:", stats.languages);
    console.log("- Recent Commits:");
    stats.recentCommits.forEach((commit) => {
      console.log(`  * [${commit.sha}] ${commit.message} (${commit.author} @ ${commit.date})`);
    });
  } catch (e) {
    console.error("Test failed with exception:", e);
  }
}

run();
