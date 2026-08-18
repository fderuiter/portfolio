import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";
import { inspectMediaBudgets, checkMediaBudgets, DEFAULT_MEDIA_BUDGETS } from "../lib/media-budget";

describe("Static Media Asset Budget Engine", () => {
  const root = process.cwd();

  it("evaluates current workspace public static media assets without budget breaches", () => {
    const report = inspectMediaBudgets(root);

    expect(report.passesBudget).toBe(true);
    expect(report.scannedFilesCount).toBeGreaterThan(0);
    expect(report.totalSizeBytes).toBeGreaterThan(0);
    expect(report.violations.length).toBe(0);
  });

  it("detects single-file budget violations when an oversized static media asset is present", () => {
    const strictConfig = {
      ...DEFAULT_MEDIA_BUDGETS,
      maxSingleFileBytes: 100 * 1024, // 100 KB strict threshold
    };

    const report = inspectMediaBudgets(root, strictConfig);

    expect(report.passesBudget).toBe(false);
    expect(report.violations.length).toBeGreaterThan(0);
    expect(report.violations[0]).toContain("exceeds individual single-file budget");
  });

  it("detects aggregate budget violations when aggregate threshold is set below total asset payload", () => {
    const strictConfig = {
      ...DEFAULT_MEDIA_BUDGETS,
      maxAggregateBytes: 1024 * 1024, // 1 MB strict aggregate limit
    };

    const report = inspectMediaBudgets(root, strictConfig);

    expect(report.passesBudget).toBe(false);
    expect(report.violations.some((v) => v.includes("Aggregate static media payload"))).toBe(true);
  });

  it("returns pass status in DX Doctor diagnostic check wrapper", () => {
    const result = checkMediaBudgets(root);

    expect(result.id).toBe("quality-media-budgets");
    expect(result.status).toBe("pass");
    expect(result.message).toContain("static media assets comply with budget thresholds");
  });

  it("returns fail status in DX Doctor diagnostic check wrapper when budget limit is breached", () => {
    const testDir = path.join(root, "tmp_test_media");
    try {
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      const dummyFile = path.join(testDir, "large_test_mesh.glb");
      const buffer = Buffer.alloc(4 * 1024 * 1024); // 4 MB dummy file
      fs.writeFileSync(dummyFile, buffer);

      const report = inspectMediaBudgets(root, {
        scanDirectories: ["tmp_test_media"],
        maxSingleFileBytes: 3 * 1024 * 1024,
      });

      expect(report.passesBudget).toBe(false);
      expect(report.violations.length).toBeGreaterThan(0);
    } finally {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    }
  });
});
