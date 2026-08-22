import { describe, it, expect, vi } from "vitest";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { inspectStandaloneBundle } from "../lib/dx/bundle-guard";
import { fromPartial } from "@total-typescript/shoehorn";

describe("Standalone JavaScript Engine Build & 50KB Size Guard", () => {
  const root = process.cwd();
  const garminJsPath = path.join(root, "public", "garmin-engine.js");
  const monkeyJsPath = path.join(root, "public", "monkey-c-mayhem.js");

  it("compiles the engine into standalone Vanilla JS assets under 50KB via build-standalone-engine script", () => {
    const output = execSync("npx tsx scripts/build-standalone-engine.ts", {
      cwd: root,
      encoding: "utf-8",
    });

    expect(output).toContain("Standalone Engine Build & Size Check Passed");
    expect(fs.existsSync(garminJsPath)).toBe(true);
    expect(fs.existsSync(monkeyJsPath)).toBe(true);

    const garminStats = fs.statSync(garminJsPath);
    const monkeyStats = fs.statSync(monkeyJsPath);

    expect(garminStats.size).toBeGreaterThan(0);
    expect(garminStats.size).toBeLessThanOrEqual(50 * 1024);
    expect(monkeyStats.size).toBeGreaterThan(0);
    expect(monkeyStats.size).toBeLessThanOrEqual(50 * 1024);
  });

  it("inspects standalone bundle size cleanly via bundle-guard", () => {
    const report = inspectStandaloneBundle(root);
    expect(report.exists).toBe(true);
    expect(report.sizeBytes).toBeGreaterThan(0);
    expect(report.sizeBytes).toBeLessThanOrEqual(50 * 1024);
    expect(report.violation).toBeUndefined();
  });

  it("detects size budget violations when standalone asset exceeds 50KB", () => {
    const spyStat = vi.spyOn(fs, "statSync").mockReturnValue(
      fromPartial<fs.Stats>({
        size: 55 * 1024, // 55KB
      })
    );

    const report = inspectStandaloneBundle(root);
    expect(report.exists).toBe(true);
    expect(report.violation).toContain("exceeds maximum budget of 50.0 kB");

    spyStat.mockRestore();
  });
});
