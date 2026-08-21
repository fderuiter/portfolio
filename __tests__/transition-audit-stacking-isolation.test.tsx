import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Systematic Transition Audit & Stacking Context Isolation Suite", () => {
  const rootDir = process.cwd();

  function findFiles(dir: string, fileRegex: RegExp): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
      if (
        file === "node_modules" ||
        file === ".next" ||
        file === ".git" ||
        file === "docs" ||
        file === "coverage" ||
        file === ".agents"
      ) {
        continue;
      }
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(findFiles(filePath, fileRegex));
      } else if (fileRegex.test(file)) {
        results.push(filePath);
      }
    }
    return results;
  }

  it("Requirement 1: Root document body styles contain no global layer promotion hints", () => {
    const globalsCssPath = path.join(rootDir, "app", "globals.css");
    expect(fs.existsSync(globalsCssPath)).toBe(true);
    const content = fs.readFileSync(globalsCssPath, "utf-8");
    const bodyBlock = content.match(/body\s*\{[\s\S]*?\}/);
    expect(bodyBlock).not.toBeNull();
    if (bodyBlock) {
      expect(bodyBlock[0]).not.toContain("will-change");
      expect(bodyBlock[0]).not.toContain("translateZ");
    }
  });

  it("Requirement 2 & Acceptance Criteria 2: Zero instances of generic transition-all or transition: all directives in application source code", () => {
    const sourceFiles = [
      ...findFiles(path.join(rootDir, "components"), /\.(tsx|jsx|ts|js|css)$/),
      ...findFiles(path.join(rootDir, "app"), /\.(tsx|jsx|ts|js|css)$/),
      ...findFiles(path.join(rootDir, "lib"), /\.(tsx|jsx|ts|js|css)$/),
    ];

    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of sourceFiles) {
      if (file.endsWith("doctor.ts")) continue;
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (line.includes("transition-all") || line.includes("transition: all") || line.includes("transition:all")) {
          violations.push({
            file: path.relative(rootDir, file),
            line: idx + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it("Requirement 3 & Acceptance Criteria 3: Stacking contexts for major sections are isolated via section-isolate and CSS containment", () => {
    const globalsCssPath = path.join(rootDir, "app", "globals.css");
    const globalsContent = fs.readFileSync(globalsCssPath, "utf-8");
    expect(globalsContent).toContain(".section-isolate");
    expect(globalsContent).toContain("isolation: isolate");
    expect(globalsContent).toContain("contain:");

    const pageLayoutPath = path.join(rootDir, "components", "PageLayout.tsx");
    const pageLayoutContent = fs.readFileSync(pageLayoutPath, "utf-8");
    expect(pageLayoutContent).toContain("section-isolate");
  });
});
