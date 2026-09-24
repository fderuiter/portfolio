import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

describe("production deploy workflow", () => {
  const workflowPath = path.join(
    process.cwd(),
    ".github/workflows/release.yml"
  );
  const workflow = fs.readFileSync(workflowPath, "utf8");
  const candidateJob = workflow.slice(
    workflow.indexOf("\n  candidate:\n"),
    workflow.indexOf("\n  deploy:\n")
  );
  const deployJob = workflow.slice(workflow.indexOf("\n  deploy:\n"));

  it("deploys main automatically once CI passes, one run at a time", () => {
    expect(workflow).toMatch(/workflow_run:\n\s+workflows: \["CI Pipeline"\]/);
    expect(workflow).toContain("branches: [main]");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toMatch(/^\s{2}(push|pull_request):/m);
    expect(workflow).toContain("group: production-release");
    expect(workflow).toContain("cancel-in-progress: false");
    expect(candidateJob).toContain(
      "github.event.workflow_run.conclusion == 'success'"
    );
    expect(candidateJob).toContain("github.event.workflow_run.event == 'push'");
  });

  it("ships only the current main tip, and a manual run only after CI passed on it", () => {
    expect(candidateJob).toContain("commits/main");
    expect(candidateJob).toContain("actions/workflows/ci.yml/runs");
    expect(deployJob).toContain("ref: ${{ needs.candidate.outputs.sha }}");
    expect(deployJob).toContain("if: needs.candidate.outputs.deploy == 'true'");
  });

  it("never re-runs the CI gates (ADR 0039)", () => {
    expect(workflow).not.toContain("npm run quality");
    expect(workflow).not.toMatch(/^\s+npm test\b/m);
  });

  it("bounds every job with a timeout", () => {
    expect(candidateJob).toMatch(/timeout-minutes:\s*5/);
    expect(deployJob).toMatch(/timeout-minutes:\s*30/);
  });

  it("keeps the migration credential in the production job and migrates once, after a replay", () => {
    expect(candidateJob).not.toContain("secrets.");
    expect(deployJob).toContain("name: production-release");
    expect(deployJob).toContain("secrets.PRODUCTION_MIGRATION_DATABASE_URL");
    expect(deployJob.match(/prisma migrate deploy/g)).toHaveLength(1);
    expect(deployJob.indexOf("npm run migration:replay")).toBeLessThan(
      deployJob.indexOf("prisma migrate deploy")
    );
    expect(deployJob).toContain("npm run check:migrations:drift");
  });

  it("builds once, stages without domains, smoke-tests through the bypass, then promotes", () => {
    const build = deployJob.indexOf("build --prod");
    const stage = deployJob.search(/--prebuilt --prod --skip-domain/);
    const smoke = deployJob.indexOf("npm run probe:synthetic");
    const promote = deployJob.indexOf('promote "$DEPLOYMENT_URL"');

    expect(build).toBeGreaterThan(0);
    expect(stage).toBeGreaterThan(build);
    expect(smoke).toBeGreaterThan(stage);
    expect(promote).toBeGreaterThan(smoke);
    expect(deployJob).toContain("secrets.VERCEL_AUTOMATION_BYPASS_SECRET");
    expect(deployJob.indexOf("VERCEL_AUTOMATION_BYPASS_SECRET")).toBeLessThan(
      deployJob.indexOf("prisma migrate deploy")
    );
    expect(deployJob).toContain("PLAYWRIGHT_TEST_BASE_URL");
    expect(
      fs.readFileSync(path.join(process.cwd(), "playwright.config.ts"), "utf8")
    ).toContain("x-vercel-protection-bypass");
  });

  it("proves the apex alias points at the promoted deployment", () => {
    expect(workflow).toContain('CANONICAL_ORIGIN: "https://deruiter.dev"');
    expect(deployJob).toContain("/v4/aliases/");
    expect(deployJob).toContain("308 ${CANONICAL_ORIGIN}/");
  });

  it("authenticates the Vercel CLI through the environment, not argv", () => {
    expect(workflow).not.toContain("--token");
  });

  it("leaves Vercel Git deployments off so only this workflow ships", () => {
    const vercelConfig = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "vercel.json"), "utf8")
    );
    expect(vercelConfig.git.deploymentEnabled).toEqual({ "*": false });
    expect(
      fs.existsSync(
        path.join(process.cwd(), ".github/workflows/rollback-drill.yml")
      )
    ).toBe(false);
  });
});
