import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

// ADR 0049: Vercel builds, migrates and promotes `main`; GitHub only runs CI.
describe("production deploy configuration", () => {
  const root = process.cwd();

  it("lets Vercel's Git integration build main and nothing else", () => {
    const config = JSON.parse(
      fs.readFileSync(path.join(root, "vercel.json"), "utf8")
    );
    expect(config.git.deploymentEnabled).toEqual({ "*": false, main: true });
  });

  it("keeps deploys out of GitHub Actions so secrets live only in Vercel", () => {
    const workflowDir = path.join(root, ".github", "workflows");
    for (const file of fs.readdirSync(workflowDir)) {
      const workflow = fs.readFileSync(path.join(workflowDir, file), "utf8");
      expect(workflow, file).not.toMatch(
        /vercel(@[\w.${}]+)?"?\s+(deploy|promote|build)\b/
      );
      expect(workflow, file).not.toContain("PRODUCTION_MIGRATION_DATABASE_URL");
    }
  });

  it("still sends the protection bypass header when a probe targets a protected URL", () => {
    expect(
      fs.readFileSync(path.join(root, "playwright.config.ts"), "utf8")
    ).toContain("x-vercel-protection-bypass");
  });
});
