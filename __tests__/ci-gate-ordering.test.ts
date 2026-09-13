import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * `npm run verify` includes invariants that assert against artifacts other
 * phases produce: the bundle budget needs a production build, and the
 * Core Web Vitals SLA reads `.benchmark-results/benchmark-results.v1.json`,
 * which only `bench:pages` writes and which is validated against the current
 * revision. Running verify before those phases makes the SLA gate unpassable.
 *
 * The `quality` script already encodes the correct order; CI must agree.
 */
describe("CI Gate Ordering", () => {
  const ciPath = path.join(process.cwd(), ".github/workflows/ci.yml");
  const ci = fs.readFileSync(ciPath, "utf8");

  /** Index of the first line whose text contains the marker, or -1. */
  const stepIndex = (marker: string): number =>
    ci.split("\n").findIndex((line) => line.includes(marker));

  it("runs the production build before the invariant verification", () => {
    const build = stepIndex("npx next build");
    const verify = stepIndex("npm run verify");

    expect(build).toBeGreaterThan(-1);
    expect(verify).toBeGreaterThan(-1);
    expect(verify).toBeGreaterThan(build);
  });

  it("produces benchmark evidence before the invariant verification reads it", () => {
    const bench = stepIndex("npm run bench:pages -- --assert");
    const verify = stepIndex("npm run verify");

    expect(bench).toBeGreaterThan(-1);
    expect(verify).toBeGreaterThan(bench);
  });

  it("keeps the quality script ordered the same way as CI", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
    ) as { scripts: Record<string, string> };

    const quality = pkg.scripts.quality;
    expect(quality).toContain("bench:pages");
    expect(quality).toContain("verify");
    expect(quality.indexOf("bench:pages")).toBeLessThan(
      quality.lastIndexOf("verify")
    );
  });

  it("keeps the benchmark evidence directory untracked", () => {
    const gitignore = fs.readFileSync(
      path.join(process.cwd(), ".gitignore"),
      "utf8"
    );
    // The SLA check rejects evidence gathered from a dirty tree, so the
    // artifacts the pipeline writes must never show up in git status.
    expect(gitignore).toMatch(/^\/?\.benchmark-results\/?$/m);
    expect(gitignore).toMatch(/^\/?\.next\/?$/m);
  });
});
