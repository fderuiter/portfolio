import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * A GitHub Actions `run:` step is a plain shell; unlike an `npm run` script it
 * does not put `node_modules/.bin` on PATH. A bare `tsc` therefore resolves to
 * whatever the runner image happens to ship globally rather than the compiler
 * pinned in package-lock.json, so the gate silently stops checking the code
 * against the toolchain the project actually uses.
 *
 * That is not hypothetical: CI once failed a typecheck on a lib.dom change
 * absent from the pinned TypeScript, an error no lockfile-faithful install
 * could reproduce.
 */
describe("CI Workflow Toolchain Pinning", () => {
  const workflowDir = path.join(process.cwd(), ".github/workflows");

  /** Binaries supplied by devDependencies, never by the runner image. */
  const projectBinaries = [
    "tsc",
    "eslint",
    "vitest",
    "prisma",
    "next",
    "playwright",
    "depcruise",
    "markdownlint",
    "tsx",
    "typedoc",
  ];

  const workflowFiles = fs
    .readdirSync(workflowDir)
    .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));

  it("finds workflow files to inspect", () => {
    expect(workflowFiles.length).toBeGreaterThan(0);
  });

  it.each(workflowFiles)(
    "%s invokes project binaries through npm or npx, never bare",
    (file) => {
      const content = fs.readFileSync(path.join(workflowDir, file), "utf8");
      const offenders: string[] = [];

      let insideRunBlock = false;
      let runBlockIndent = 0;

      for (const rawLine of content.split("\n")) {
        const line = rawLine.replace(/\s+$/, "");
        if (line.trim() === "") continue;

        const indent = line.length - line.trimStart().length;
        const trimmed = line.trim();

        // A `run: |` opens a block whose body is indented further.
        const blockRun = trimmed.match(/^run:\s*[|>][-+]?\s*$/);
        if (blockRun) {
          insideRunBlock = true;
          runBlockIndent = indent;
          continue;
        }

        // A single-line `run: <command>`.
        const inlineRun = trimmed.match(/^run:\s*(\S.*)$/);
        if (inlineRun) {
          insideRunBlock = false;
          const first = inlineRun[1].trim().split(/\s+/)[0];
          if (projectBinaries.includes(first)) {
            offenders.push(inlineRun[1].trim());
          }
          continue;
        }

        if (insideRunBlock) {
          if (indent <= runBlockIndent) {
            insideRunBlock = false;
          } else {
            const first = trimmed.split(/\s+/)[0];
            if (projectBinaries.includes(first)) {
              offenders.push(trimmed);
            }
            continue;
          }
        }
      }

      expect(offenders).toEqual([]);
    }
  );

  it("runs the typecheck gate through the pinned compiler", () => {
    const ciPath = path.join(workflowDir, "ci.yml");
    const ci = fs.readFileSync(ciPath, "utf8");
    const typeCheckStep = ci
      .split("- name:")
      .find((section) => section.includes("Type Check"));

    expect(typeCheckStep).toBeDefined();
    expect(typeCheckStep).toContain("npm run typecheck");
    expect(typeCheckStep).not.toMatch(/^\s*tsc\s/m);

    const pkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
    ) as { scripts: Record<string, string> };
    expect(pkg.scripts.typecheck).toBe("tsc --noEmit");
  });
});
