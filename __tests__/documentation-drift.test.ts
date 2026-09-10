import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkDocumentationDrift } from "../scripts/documentation-drift";

const temporaryDirectories: string[] = [];

function createFixture(): { root: string; docs: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-doc-drift-"));
  temporaryDirectories.push(root);
  const docs = path.join(root, "docs");
  fs.mkdirSync(docs, { recursive: true });
  fs.writeFileSync(path.join(docs, "reference.md"), "# Reference\n", "utf8");
  return { root, docs };
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
});
