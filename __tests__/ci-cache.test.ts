import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("CI Workflow Dual Caching and Isolation Suite", () => {
  const workflowPath = path.join(process.cwd(), ".github/workflows/ci.yml");

  it("should have the ci.yml workflow file present", () => {
    expect(fs.existsSync(workflowPath)).toBe(true);
  });

  const content = fs.readFileSync(workflowPath, "utf8");

  describe("Playwright Browser Caching Config", () => {
    it("should configure branch-isolated caching with lockfile-based invalidation for Playwright", () => {
      // Find the Playwright cache block
      const playwrightSection = content.split("- name:").find(section => section.includes("Cache Playwright Browsers"));
      expect(playwrightSection).toBeDefined();

      if (playwrightSection) {
        // Path should be correct
        expect(playwrightSection).toContain("path: ~/.cache/ms-playwright");

        // Key should be branch-isolated and lockfile hash dependent
        expect(playwrightSection).toMatch(/key:\s*playwright-\$\{\{\s*github\.head_ref\s*\|\|\s*github\.ref_name\s*\}\}-\$\{\{\s*hashFiles\(['"]package-lock\.json['"]\)\s*\}\}/);

        // Restore keys should fallback to main and must be branch-isolated with lockfile hash dependent to ensure complete invalidation on lockfile changes
        const restoreKeysMatch = playwrightSection.match(/restore-keys:\s*\|((?:\n\s{12,}\S.*)+)/);
        expect(restoreKeysMatch).not.toBeNull();

        if (restoreKeysMatch) {
          const restoreKeys = restoreKeysMatch[1].trim().split("\n").map(k => k.trim());
          
          // Should have at least two restore keys: branch specific with hash and main specific with hash
          expect(restoreKeys.length).toBeGreaterThanOrEqual(2);

          // Branch specific restore key with hash
          const branchSpecificRestoreKey = restoreKeys[0];
          expect(branchSpecificRestoreKey).toMatch(/playwright-\$\{\{\s*github\.head_ref\s*\|\|\s*github\.ref_name\s*\}\}-\$\{\{\s*hashFiles\(['"]package-lock\.json['"]\)\s*\}\}/);

          // Main specific fallback restore key with hash
          const mainSpecificRestoreKey = restoreKeys[1];
          expect(mainSpecificRestoreKey).toMatch(/playwright-main-\$\{\{\s*hashFiles\(['"]package-lock\.json['"]\)\s*\}\}/);
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
        expect(nextjsSection).toMatch(/key:\s*nextjs-\$\{\{\s*github\.head_ref\s*\|\|\s*github\.ref_name\s*\}\}-\$\{\{\s*hashFiles\(['"]package-lock\.json['"]\)\s*\}\}-\$\{\{\s*github\.sha\s*\}\}/);

        // Restore keys should fallback to same branch or main branch, with lockfile hash prefix for complete invalidation on lockfile changes
        const restoreKeysMatch = nextjsSection.match(/restore-keys:\s*\|((?:\n\s{12,}\S.*)+)/);
        expect(restoreKeysMatch).not.toBeNull();

        if (restoreKeysMatch) {
          const restoreKeys = restoreKeysMatch[1].trim().split("\n").map(k => k.trim());
          
          // Should have at least two restore keys: branch specific with hash and main specific with hash
          expect(restoreKeys.length).toBeGreaterThanOrEqual(2);

          // Branch specific restore key prefix with hash
          const branchSpecificRestoreKey = restoreKeys[0];
          expect(branchSpecificRestoreKey).toMatch(/nextjs-\$\{\{\s*github\.head_ref\s*\|\|\s*github\.ref_name\s*\}\}-\$\{\{\s*hashFiles\(['"]package-lock\.json['"]\)\s*\}\}-/);

          // Main specific fallback restore key prefix with hash
          const mainSpecificRestoreKey = restoreKeys[1];
          expect(mainSpecificRestoreKey).toMatch(/nextjs-main-\$\{\{\s*hashFiles\(['"]package-lock\.json['"]\)\s*\}\}-/);
        }
      }
    });
  });

  describe("Synthetic Probes Workflow Caching and Dependency Suite", () => {
    const syntheticWorkflowPath = path.join(process.cwd(), ".github/workflows/synthetic-probes.yml");

    it("should have the synthetic-probes.yml workflow file present", () => {
      expect(fs.existsSync(syntheticWorkflowPath)).toBe(true);
    });

    const syntheticContent = fs.readFileSync(syntheticWorkflowPath, "utf8");

    it("should configure Playwright cache and conditional host dependency installation on cache hit", () => {
      // Find the Playwright cache block in synthetic probes
      const playwrightCacheSection = syntheticContent.split("- name:").find(section => section.includes("Cache Playwright Browsers"));
      expect(playwrightCacheSection).toBeDefined();

      if (playwrightCacheSection) {
        expect(playwrightCacheSection).toContain("path: ~/.cache/ms-playwright");
        expect(playwrightCacheSection).toMatch(/key:\s*playwright-synthetic-\$\{\{\s*hashFiles\(['"]package-lock\.json['"]\)\s*\}\}/);
      }

      // Check cache miss installation step
      const cacheMissSection = syntheticContent.split("- name:").find(section => section.includes("Install Playwright Browsers (Cache Miss)"));
      expect(cacheMissSection).toBeDefined();
      if (cacheMissSection) {
        expect(cacheMissSection).toContain("if: steps.playwright-cache.outputs.cache-hit != 'true'");
        expect(cacheMissSection).toContain("run: npx playwright install chromium --with-deps");
      }

      // Check cache hit dependency-only installation step
      const cacheHitSection = syntheticContent.split("- name:").find(section => section.includes("Install Playwright Dependencies Only (Cache Hit)"));
      expect(cacheHitSection).toBeDefined();
      if (cacheHitSection) {
        expect(cacheHitSection).toContain("if: steps.playwright-cache.outputs.cache-hit == 'true'");
        expect(cacheHitSection).toContain("run: npx playwright install-deps chromium");
      }
    });
  });
});

