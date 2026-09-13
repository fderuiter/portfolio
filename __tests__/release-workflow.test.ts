import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

describe("protected production release workflow", () => {
  const workflowPath = path.join(
    process.cwd(),
    ".github/workflows/release.yml"
  );

  it("is a manual, serialized, environment-approved release", () => {
    expect(fs.existsSync(workflowPath)).toBe(true);

    const workflow = fs.readFileSync(workflowPath, "utf8");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toMatch(/^\s{2}(push|pull_request):/m);
    expect(workflow).toContain("group: production-release");
    expect(workflow).toContain("cancel-in-progress: false");
    expect(workflow).toContain("name: production-release");
    expect(workflow).toMatch(/timeout-minutes:\s*45/);
  });

  it("proves migration replay before exposing the protected credential", () => {
    const workflow = fs.readFileSync(workflowPath, "utf8");
    const verifyJob = workflow.slice(
      workflow.indexOf("  verify-release:"),
      workflow.indexOf("  release-production:")
    );
    const releaseJob = workflow.slice(
      workflow.indexOf("  release-production:")
    );

    expect(verifyJob).toContain("npm run migration:replay");
    expect(verifyJob).not.toContain("PRODUCTION_MIGRATION_DATABASE_URL");
    expect(releaseJob).toContain("secrets.PRODUCTION_MIGRATION_DATABASE_URL");
    expect(releaseJob.match(/prisma migrate deploy/g)).toHaveLength(1);
    expect(releaseJob).toContain("npm run check:migrations:drift");
  });

  it("stages, verifies, records, and promotes one immutable build before tagging", () => {
    const workflow = fs.readFileSync(workflowPath, "utf8");

    expect(workflow).toMatch(/vercel@\$\{VERCEL_CLI_VERSION\}" build --prod/);
    expect(workflow).toMatch(/deploy \\\n+\s+--prebuilt --prod --skip-domain/);
    expect(workflow).toContain("PLAYWRIGHT_TEST_BASE_URL");
    expect(workflow).toMatch(
      /vercel@\$\{VERCEL_CLI_VERSION\}\" promote \"\$DEPLOYMENT_URL\"/
    );

    const recordIndex = workflow.indexOf("name: Record release evidence");
    const tagIndex = workflow.indexOf("name: Create tag and GitHub release");
    expect(recordIndex).toBeGreaterThan(0);
    expect(tagIndex).toBeGreaterThan(recordIndex);
  });

  it("disables automatic Git deployments and provides a no-build rollback drill", () => {
    const vercelConfig = fs.readFileSync(
      path.join(process.cwd(), "vercel.json"),
      "utf8"
    );
    const drill = fs.readFileSync(
      path.join(process.cwd(), ".github/workflows/rollback-drill.yml"),
      "utf8"
    );

    expect(vercelConfig).not.toContain('"main": true');
    expect(drill).toContain("workflow_dispatch:");
    expect(drill).toContain("alias set");
    expect(drill).toContain("rollback-drill-evidence.json");
    expect(drill).not.toContain("vercel build");
    expect(drill).not.toContain("vercel deploy");
  });
});
