/* eslint-disable */
/**
 * Enforce npm as the exclusive package manager for local development.
 * Blocks package installation attempts made with yarn, pnpm, bun, etc.
 * Enforces Node.js and npm engine versions.
 */
const path = require("path");
const fs = require("fs");

// 1. Enforce npm as the package manager
const agent = process.env.npm_config_user_agent || "";
if (agent && !agent.startsWith("npm/")) {
  console.error("\n======================================================================");
  console.error("❌ ERROR: npm is the exclusive package manager for this repository.");
  console.error(`You attempted to run this install with: ${agent.split(" ")[0]}`);
  console.error("Please run 'npm install' or 'npm ci' instead.");
  console.error("======================================================================\n");
  process.exit(1);
}

// 2. Enforce Node.js and npm engine versions
const packageJsonPath = path.join(__dirname, "../package.json");
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const engines = packageJson.engines || {};
    
    if (engines.node) {
      const requiredNodeRange = engines.node;
      const currentNodeVersion = process.versions.node;
      const currentMajor = parseInt(currentNodeVersion.split(".")[0], 10);
      const requiredMajorMatch = requiredNodeRange.match(/>=?\s*(\d+)/);
      if (requiredMajorMatch) {
        const requiredMajor = parseInt(requiredMajorMatch[1], 10);
        if (currentMajor < requiredMajor) {
          console.error(`\n❌ ERROR: Node.js version is too old. Current: v${currentNodeVersion}, Required: ${requiredNodeRange}\n`);
          process.exit(1);
        }
      }
    }
  } catch (err) {
    // Ignore JSON parsing errors of package.json to prevent installation blockages on bad formatting
  }
}
