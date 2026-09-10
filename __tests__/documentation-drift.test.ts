import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkDocumentationDrift } from "../scripts/documentation-drift";
import {
  checkDrift,
  type DriftCheckDependencies,
} from "../scripts/check-drift";

const temporaryDirectories: string[] = [];

function createFixture(): { root: string; docs: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-doc-drift-"));
  temporaryDirectories.push(root);
  const docs = path.join(root, "docs");
  fs.mkdirSync(docs, { recursive: true });
  fs.writeFileSync(path.join(docs, "reference.md"), "# Reference\n", "utf8");
  return { root, docs };
}

function passingDependencies(): DriftCheckDependencies {
  return {
    checkDocumentation: () => ({ status: "pass", details: [] }),
    checkOpenApi: () => ({ missingRoutes: [], hasDrift: false }),
    checkOnboarding: () => ({ status: "pass" }),
    checkTopology: () => ({ status: "pass" }),
  };
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("documentation drift checking", () => {
  it("compares an isolated compilation without rewriting the tracked documentation", () => {
    const { root, docs } = createFixture();
    const original = fs.readFileSync(path.join(docs, "reference.md"), "utf8");

    const result = checkDocumentationDrift({
      workspaceRoot: root,
      compile: (outputDirectory) => {
        fs.mkdirSync(outputDirectory, { recursive: true });
        fs.writeFileSync(
          path.join(outputDirectory, "reference.md"),
          original,
          "utf8"
        );
      },
      getGitStatus: () => ({ modified: [], untracked: [] }),
    });

    expect(result.status).toBe("pass");
    expect(fs.readFileSync(path.join(docs, "reference.md"), "utf8")).toBe(
      original
    );
  });

  it("reports stale generated references without rewriting them", () => {
    const { root, docs } = createFixture();
    const original = fs.readFileSync(path.join(docs, "reference.md"), "utf8");

    const result = checkDocumentationDrift({
      workspaceRoot: root,
      compile: (outputDirectory) => {
        fs.writeFileSync(
          path.join(outputDirectory, "reference.md"),
          "# Updated reference\n",
          "utf8"
        );
      },
      getGitStatus: () => ({ modified: [], untracked: [] }),
    });

    expect(result).toMatchObject({ status: "fail" });
    expect(result.details).toContain(
      "Stale generated reference: docs/reference.md differs from generated output"
    );
    expect(fs.readFileSync(path.join(docs, "reference.md"), "utf8")).toBe(
      original
    );
  });

  it("reports a missing generated page when a public export is added", () => {
    const { root } = createFixture();

    const result = checkDocumentationDrift({
      workspaceRoot: root,
      compile: (outputDirectory) => {
        fs.writeFileSync(
          path.join(outputDirectory, "reference.md"),
          "# Reference\n",
          "utf8"
        );
        fs.mkdirSync(path.join(outputDirectory, "hooks"), { recursive: true });
        fs.writeFileSync(
          path.join(outputDirectory, "hooks", "useNewExport.md"),
          "# New public export\n",
          "utf8"
        );
      },
      getGitStatus: () => ({ modified: [], untracked: [] }),
    });

    expect(result).toMatchObject({ status: "fail" });
    expect(result.details).toContain(
      "Stale generated reference: missing docs/hooks/useNewExport.md"
    );
  });

  it("distinguishes an untracked authored audit report from generated drift", () => {
    const { root, docs } = createFixture();
    const auditPath = path.join(docs, "audits", "workflow.md");
    fs.mkdirSync(path.dirname(auditPath), { recursive: true });
    fs.writeFileSync(auditPath, "# Workflow audit\n", "utf8");

    const result = checkDocumentationDrift({
      workspaceRoot: root,
      compile: (outputDirectory) => {
        fs.writeFileSync(
          path.join(outputDirectory, "reference.md"),
          "# Reference\n",
          "utf8"
        );
      },
      getGitStatus: () => ({
        modified: [],
        untracked: ["docs/audits/workflow.md"],
      }),
    });

    expect(result).toMatchObject({ status: "fail" });
    expect(result.details).toContain(
      "Authored documentation untracked: docs/audits/workflow.md. Stage or remove the authored report."
    );
    expect(fs.readFileSync(auditPath, "utf8")).toBe("# Workflow audit\n");
  });

  it("distinguishes an authored documentation edit from generated drift", () => {
    const { root } = createFixture();

    const result = checkDocumentationDrift({
      workspaceRoot: root,
      compile: (outputDirectory) => {
        fs.writeFileSync(
          path.join(outputDirectory, "reference.md"),
          "# Reference\n",
          "utf8"
        );
      },
      getGitStatus: () => ({
        modified: ["docs/planning/next.md"],
        untracked: [],
      }),
    });

    expect(result).toMatchObject({ status: "fail" });
    expect(result.details).toContain(
      "Authored documentation modified: docs/planning/next.md. Stage or revert the authored edit."
    );
  });

  it("returns an actionable generator failure", () => {
    const { root } = createFixture();

    const result = checkDocumentationDrift({
      workspaceRoot: root,
      compile: () => {
        throw new Error("TypeDoc failed");
      },
      getGitStatus: () => ({ modified: [], untracked: [] }),
    });

    expect(result).toEqual({
      status: "error",
      details: ["Documentation generator failed: TypeDoc failed"],
    });
  });

  it("returns a failing CLI status for stale generated references", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const dependencies = passingDependencies();
    dependencies.checkDocumentation = () => ({
      status: "fail",
      details: ["Stale generated reference: missing docs/hooks/useRemoved.md"],
    });

    expect(checkDrift("/workspace", dependencies)).toBe(1);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining(
        "Stale generated reference: missing docs/hooks/useRemoved.md"
      )
    );
    error.mockRestore();
  });

  it("reports missing API contracts with a failing CLI status", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const dependencies = passingDependencies();
    dependencies.checkOpenApi = () => ({
      missingRoutes: ["/api/telemetry"],
      hasDrift: false,
    });

    expect(checkDrift("/workspace", dependencies)).toBe(1);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining(
        "Undocumented API routes detected (1):\n  - /api/telemetry"
      )
    );
    error.mockRestore();
  });
});
