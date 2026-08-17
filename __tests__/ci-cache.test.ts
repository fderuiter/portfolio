import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("CI Workflow Dual Caching and Isolation Suite", () => {
  const workflowPath = path.join(process.cwd(), ".github/workflows/ci.yml");

  it("should have the ci.yml workflow file present", () => {
    expect(fs.existsSync(workflowPath)).toBe(true);
  });

  const content = fs.readFileSync(workflowPath, "utf8");

  describe("Lockfile Validation Execution Order", () => {
    it("should ensure lockfile validation runs before expensive installation steps", () => {
      // Find the index or step name of Lockfile validation and npm ci
      const steps = content.split("- name:").map(s => s.trim());
      const lockfileStepIndex = steps.findIndex(step => step.toLowerCase().includes("verify lockfile"));
      const npmCiStepIndex = steps.findIndex(step => step.includes("Install Dependencies") || step.includes("npm ci"));
      
      expect(lockfileStepIndex).toBeGreaterThan(-1);
      expect(npmCiStepIndex).toBeGreaterThan(-1);
      expect(lockfileStepIndex).toBeLessThan(npmCiStepIndex);
    });
  });

  describe("Playwright Browser Caching Config", () => {
    it("should configure branch-isolated caching with lockfile-based invalidation for Playwright", () => {
      // Find the Playwright cache block
      const playwrightSection = content.split("- name:").find(section => section.includes("Cache Playwright Browsers"));
      expect(playwrightSection).toBeDefined();

      if (playwrightSection) {
        // Path should be correct
        expect(playwrightSection).toContain("path: ~/.cache/ms-playwright");

        // Key should be branch-isolated and lockfile hash dependent
        expect(playwrightSection).toMatch(/key:\s*playwright-\$\{\{\s*github\.head_ref\s*\|\|\s*github\.ref_name\s*\}\}-\$\{\{\s*hashFiles\(['"]package-lock\.json['"],\s*['"]bun\.lock['"]\)\s*\}\}/);

        // Restore keys should fallback to main and must be branch-isolated with lockfile hash dependent to ensure complete invalidation on lockfile changes
        const restoreKeysMatch = playwrightSection.match(/restore-keys:\s*\|((?:\n\s{12,}\S.*)+)/);
        expect(restoreKeysMatch).not.toBeNull();

        if (restoreKeysMatch) {
          const restoreKeys = restoreKeysMatch[1].trim().split("\n").map(k => k.trim());
          
          // Should have at least two restore keys: branch specific with hash and main specific with hash
          expect(restoreKeys.length).toBeGreaterThanOrEqual(2);

          // Branch specific restore key with hash
          const branchSpecificRestoreKey = restoreKeys[0];
          expect(branchSpecificRestoreKey).toMatch(/playwright-\$\{\{\s*github\.head_ref\s*\|\|\s*github\.ref_name\s*\}\}-\$\{\{\s*hashFiles\(['"]package-lock\.json['"],\s*['"]bun\.lock['"]\)\s*\}\}/);

          // Main specific fallback restore key with hash
          const mainSpecificRestoreKey = restoreKeys[1];
          expect(mainSpecificRestoreKey).toMatch(/playwright-main-\$\{\{\s*hashFiles\(['"]package-lock\.json['"],\s*['"]bun\.lock['"]\)\s*\}\}/);
        }
      }
    });
  });

  describe("Next.js Build Caching Config", () => {
    it("should configure branch-isolated incremental caching with lockfile-based invalidation for Next.js", () => {
      // Find the Next.js cache block
      const nextjsSection = content.split("- name:").find(section => section.includes("Next.js Cache"));
      expect(nextjsSection).toBeDefined();

      if (nextjsSection) {
        // Path should be correct
        expect(nextjsSection).toContain("path: ${{ github.workspace }}/.next/cache");

        // Key should be branch-isolated, lockfile hash dependent, and end with github.sha for incremental writes
        expect(nextjsSection).toMatch(/key:\s*nextjs-\$\{\{\s*github\.head_ref\s*\|\|\s*github\.ref_name\s*\}\}-\$\{\{\s*hashFiles\(['"]package-lock\.json['"],\s*['"]bun\.lock['"]\)\s*\}\}-\$\{\{\s*github\.sha\s*\}\}/);

        // Restore keys should fallback to same branch or main branch, with lockfile hash prefix for complete invalidation on lockfile changes
        const restoreKeysMatch = nextjsSection.match(/restore-keys:\s*\|((?:\n\s{12,}\S.*)+)/);
        expect(restoreKeysMatch).not.toBeNull();

        if (restoreKeysMatch) {
          const restoreKeys = restoreKeysMatch[1].trim().split("\n").map(k => k.trim());
          
          // Should have at least two restore keys: branch specific with hash and main specific with hash
          expect(restoreKeys.length).toBeGreaterThanOrEqual(2);

          // Branch specific restore key prefix with hash
          const branchSpecificRestoreKey = restoreKeys[0];
          expect(branchSpecificRestoreKey).toMatch(/nextjs-\$\{\{\s*github\.head_ref\s*\|\|\s*github\.ref_name\s*\}\}-\$\{\{\s*hashFiles\(['"]package-lock\.json['"],\s*['"]bun\.lock['"]\)\s*\}\}-/);

          // Main specific fallback restore key prefix with hash
          const mainSpecificRestoreKey = restoreKeys[1];
          expect(mainSpecificRestoreKey).toMatch(/nextjs-main-\$\{\{\s*hashFiles\(['"]package-lock\.json['"],\s*['"]bun\.lock['"]\)\s*\}\}-/);
        }
      }
    });
  });
});
