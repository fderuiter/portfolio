import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs";
import os from "os";
import { inspectMediaBudgets, checkMediaBudgets } from "@/lib/dx/media-guard";

describe("Build-Time Static Media Asset Budget Engine", () => {
  let tempWorkspace: string;
  let publicDir: string;

  beforeEach(() => {
    tempWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "media-guard-test-"));
    publicDir = path.join(tempWorkspace, "public");
    fs.mkdirSync(publicDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempWorkspace, { recursive: true, force: true });
  });

  it("scans static media files and reports totals cleanly when under budget", () => {
    // Write 2 small files (e.g. 100KB image and 200KB 3D model)
    const imgDir = path.join(publicDir, "duck");
    fs.mkdirSync(imgDir, { recursive: true });
    fs.writeFileSync(path.join(imgDir, "duck-test.jpg"), Buffer.alloc(100 * 1024));

    const modelDir = path.join(publicDir, "models");
    fs.mkdirSync(modelDir, { recursive: true });
    fs.writeFileSync(path.join(modelDir, "brain-test.glb"), Buffer.alloc(200 * 1024));

    const report = inspectMediaBudgets(tempWorkspace, {
      maxSingleFileBytes: 1 * 1024 * 1024, // 1MB limit
      maxAggregateBytes: 5 * 1024 * 1024,  // 5MB limit
    });

    expect(report.totalFiles).toBe(2);
    expect(report.totalBytes).toBe(300 * 1024);
    expect(report.violations).toHaveLength(0);

    const doctorResult = checkMediaBudgets(tempWorkspace, {
      maxSingleFileBytes: 1 * 1024 * 1024,
      maxAggregateBytes: 5 * 1024 * 1024,
    });
    expect(doctorResult.status).toBe("pass");
    expect(doctorResult.message).toContain("comply with performance budgets");
  });

  it("fails validation whenever an individual media file exceeds the single-file size limit", () => {
    const filesDir = path.join(publicDir, "files");
    fs.mkdirSync(filesDir, { recursive: true });
    // Write a 3MB file
    fs.writeFileSync(path.join(filesDir, "oversized-poster.psd"), Buffer.alloc(3 * 1024 * 1024));

    const report = inspectMediaBudgets(tempWorkspace, {
      maxSingleFileBytes: 2 * 1024 * 1024, // 2MB limit
      maxAggregateBytes: 10 * 1024 * 1024,
    });

    expect(report.violations.length).toBeGreaterThan(0);
    expect(report.violations[0]).toContain("exceeds maximum single-file budget");

    const doctorResult = checkMediaBudgets(tempWorkspace, {
      maxSingleFileBytes: 2 * 1024 * 1024,
      maxAggregateBytes: 10 * 1024 * 1024,
    });
    expect(doctorResult.status).toBe("fail");
    expect(doctorResult.message).toContain("breached defined performance budgets");
  });

  it("fails validation whenever the aggregate payload size exceeds total media threshold", () => {
    const filesDir = path.join(publicDir, "files");
    fs.mkdirSync(filesDir, { recursive: true });
    // Write 3 x 2MB files = 6MB total
    fs.writeFileSync(path.join(filesDir, "file1.zip"), Buffer.alloc(2 * 1024 * 1024));
    fs.writeFileSync(path.join(filesDir, "file2.zip"), Buffer.alloc(2 * 1024 * 1024));
    fs.writeFileSync(path.join(filesDir, "file3.zip"), Buffer.alloc(2 * 1024 * 1024));

    const report = inspectMediaBudgets(tempWorkspace, {
      maxSingleFileBytes: 3 * 1024 * 1024, // 3MB per file ok
      maxAggregateBytes: 5 * 1024 * 1024,  // 5MB aggregate limit breached
    });

    expect(report.violations).toHaveLength(1);
    expect(report.violations[0]).toContain("Aggregate static media payload size");
  });
});
