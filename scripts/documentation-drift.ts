import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { compileDocumentation } from "./compile-docs";

export interface DocumentationGitStatus {
  modified: string[];
  untracked: string[];
}

export interface DocumentationDriftOptions {
  workspaceRoot: string;
  compile: (outputDirectory: string) => void;
  getGitStatus: () => DocumentationGitStatus;
}

export interface DocumentationDriftResult {
  status: "pass" | "fail" | "error";
  details: string[];
}

function listFiles(directory: string, relativeDirectory = ""): string[] {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? listFiles(absolutePath, relativePath)
      : [relativePath];
  });
}

function normalizePath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

function getGeneratedDifferences(
  generatedDirectory: string,
  docsDirectory: string
): string[] {
  return listFiles(generatedDirectory).flatMap((relativePath) => {
    const generatedPath = path.join(generatedDirectory, relativePath);
    const documentationPath = path.join(docsDirectory, relativePath);
    if (!fs.existsSync(documentationPath)) {
      return [
        `Stale generated reference: missing docs/${normalizePath(relativePath)}`,
      ];
    }
    return fs
      .readFileSync(generatedPath)
      .equals(fs.readFileSync(documentationPath))
      ? []
      : [
          `Stale generated reference: docs/${normalizePath(relativePath)} differs from generated output`,
        ];
  });
}

function classifyWorkingTreeChanges(
  gitStatus: DocumentationGitStatus,
  generatedFiles: Set<string>
): string[] {
  const classify = (filePath: string, state: "modified" | "untracked") => {
    const normalized = normalizePath(filePath).replace(/^docs\//u, "");
    if (generatedFiles.has(normalized)) {
      return `Stale generated reference: docs/${normalized} is ${state}`;
    }
    const action =
      state === "modified"
        ? "Stage or revert the authored edit"
        : "Stage or remove the authored report";
    return `Authored documentation ${state}: docs/${normalized}. ${action}.`;
  };

  return [
    ...gitStatus.modified.map((filePath) => classify(filePath, "modified")),
    ...gitStatus.untracked.map((filePath) => classify(filePath, "untracked")),
  ];
}

/**
 * Compiles generated documentation into a temporary destination and compares it
 * with the checked-in references without mutating the workspace.
 */
export function checkDocumentationDrift({
  workspaceRoot,
  compile,
  getGitStatus,
}: DocumentationDriftOptions): DocumentationDriftResult {
  const outputDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "portfolio-docs-check-")
  );
  const docsDirectory = path.join(workspaceRoot, "docs");

  try {
    try {
      compile(outputDirectory);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: "error",
        details: [`Documentation generator failed: ${message}`],
      };
    }

    const generatedFiles = new Set(
      listFiles(outputDirectory).map(normalizePath)
    );
    const details = [
      ...getGeneratedDifferences(outputDirectory, docsDirectory),
      ...classifyWorkingTreeChanges(getGitStatus(), generatedFiles),
    ];
    return details.length === 0
      ? { status: "pass", details }
      : { status: "fail", details };
  } finally {
    fs.rmSync(outputDirectory, { recursive: true, force: true });
  }
}

export function getDocumentationGitStatus(
  workspaceRoot: string
): DocumentationGitStatus {
  const list = (args: string[]) =>
    execFileSync("git", args, {
      cwd: workspaceRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .trim()
      .split("\n")
      .filter(Boolean);

  return {
    modified: list(["diff", "--name-only", "--", "docs"]),
    untracked: list(["ls-files", "--others", "--exclude-standard", "docs"]),
  };
}

export { compileDocumentation };
