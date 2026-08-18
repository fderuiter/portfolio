import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { MockInstance } from "vitest";
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

vi.mock("child_process", () => {
  const mSpawnSync = vi.fn();
  return {
    spawnSync: mSpawnSync,
    default: {
      spawnSync: mSpawnSync,
    },
  };
});

import {
  isPretextRelated,
  loadIgnoreList,
  loadAndValidateExemptionManifest,
  runSecurityAudit,
} from "../scripts/security-audit";
import type { VulnerabilityInfo } from "../scripts/security-audit";

describe("Security Audit Script", () => {
  let exitSpy: MockInstance<typeof process.exit>;
  let logSpy: MockInstance<typeof console.log>;
  let errorSpy: MockInstance<typeof console.error>;

  beforeEach(() => {
    vi.resetAllMocks();
    exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit called with ${code}`);
    }) as unknown as MockInstance<typeof process.exit>;
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {}) as unknown as MockInstance<typeof console.log>;
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {}) as unknown as MockInstance<typeof console.error>;
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe("isPretextRelated", () => {
    it("returns true for exact package name", () => {
      expect(isPretextRelated("@chenglou/pretext", {})).toBe(true);
    });

    it("returns true for names containing pretext", () => {
      expect(isPretextRelated("pretext-helper", {})).toBe(true);
    });

    it("returns true if via array contains a string with pretext", () => {
      expect(isPretextRelated("some-dep", { via: ["@chenglou/pretext"] })).toBe(true);
    });

    it("returns true if via array contains an object with pretext dependency details", () => {
      expect(isPretextRelated("some-dep", {
        via: [{ name: "@chenglou/pretext", title: "vulnerability" }]
      })).toBe(true);
    });

    it("returns false for non-pretext package", () => {
      expect(isPretextRelated("lodash", { via: ["another-package"] })).toBe(false);
    });
  });

  describe("loadAndValidateExemptionManifest", () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "manifest-test-"));
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it("returns found=false when exemption manifest file is missing", () => {
      const result = loadAndValidateExemptionManifest(tempDir);
      expect(result.found).toBe(false);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("missing");
    });

    it("returns valid=false when an exemption entry lacks mandatory justification (rationale)", () => {
      const manifestPath = path.join(tempDir, "security-audit-exemptions.json");
      fs.writeFileSync(
        manifestPath,
        JSON.stringify([
          {
            package: "vulnerable-pkg",
            advisory: "GHSA-1234",
            // missing rationale
          },
        ])
      );

      const result = loadAndValidateExemptionManifest(tempDir);
      expect(result.found).toBe(true);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("rationale"))).toBe(true);
    });

    it("returns valid=false when an exemption entry lacks mandatory advisory metadata", () => {
      const manifestPath = path.join(tempDir, "security-audit-exemptions.json");
      fs.writeFileSync(
        manifestPath,
        JSON.stringify([
          {
            package: "vulnerable-pkg",
            rationale: "Testing rationale text",
            // missing advisory
          },
        ])
      );

      const result = loadAndValidateExemptionManifest(tempDir);
      expect(result.found).toBe(true);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("advisory"))).toBe(true);
    });

    it("returns valid=false when legacy string array format is used", () => {
      const manifestPath = path.join(tempDir, "security-audit-exemptions.json");
      fs.writeFileSync(manifestPath, JSON.stringify(["concurrently", "next"]));

      const result = loadAndValidateExemptionManifest(tempDir);
      expect(result.found).toBe(true);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(2);
    });

    it("returns valid=true and parsed entries for a valid manifest", () => {
      const manifestPath = path.join(tempDir, "security-audit-exemptions.json");
      fs.writeFileSync(
        manifestPath,
        JSON.stringify([
          {
            package: "concurrently",
            rationale: "Dev CLI tool, non-exploitable at runtime",
            advisory: "GHSA-shell-quote",
          },
        ])
      );

      const result = loadAndValidateExemptionManifest(tempDir);
      expect(result.found).toBe(true);
      expect(result.valid).toBe(true);
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].package).toBe("concurrently");
    });
  });

  describe("loadIgnoreList", () => {
    it("returns package list from valid repository manifest", () => {
      const list = loadIgnoreList();
      expect(list).toContain("concurrently");
      expect(list).toContain("next");
    });
  });

  describe("runSecurityAudit", () => {
    it("should pass when there are no vulnerabilities and manifest is valid", () => {
      vi.mocked(spawnSync).mockReturnValue({
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: {}
        })
      } as unknown as ReturnType<typeof spawnSync>);

      expect(() => runSecurityAudit()).toThrowError("process.exit called with 0");
      expect(exitSpy).toHaveBeenCalledWith(0);
      expect(logSpy).toHaveBeenCalled();
    });

    it("should ignore low and moderate vulnerabilities and pass", () => {
      vi.mocked(spawnSync).mockReturnValue({
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: {
            lodash: {
              name: "lodash",
              severity: "moderate"
            },
            ms: {
              name: "ms",
              severity: "low"
            }
          }
        })
      } as unknown as ReturnType<typeof spawnSync>);

      expect(() => runSecurityAudit()).toThrowError("process.exit called with 0");
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it("should pass when high/critical vulnerabilities match exempted packages in manifest", () => {
      vi.mocked(spawnSync).mockReturnValue({
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: {
            concurrently: {
              name: "concurrently",
              severity: "critical",
              via: ["shell-quote"]
            }
          }
        })
      } as unknown as ReturnType<typeof spawnSync>);

      expect(() => runSecurityAudit()).toThrowError("process.exit called with 0");
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it("should fail when unexempted high/critical vulnerabilities exist", () => {
      vi.mocked(spawnSync).mockReturnValue({
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: {
            "unvetted-dangerous-pkg": {
              name: "unvetted-dangerous-pkg",
              severity: "high",
              via: [
                {
                  title: "Malicious command execution",
                  url: "https://github.com/advisories/GHSA-unsafe",
                  range: "<1.0.0"
                }
              ]
            }
          }
        })
      } as unknown as ReturnType<typeof spawnSync>);

      expect(() => runSecurityAudit()).toThrowError("process.exit called with 1");
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it("should handle pretext vulnerabilities by failing and logging redacted message", () => {
      vi.mocked(spawnSync).mockReturnValue({
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: {
            "@chenglou/pretext": {
              name: "@chenglou/pretext",
              severity: "high",
              via: [
                {
                  title: "Denial of service via extremely long input",
                  url: "https://github.com/advisories/GHSA-pretext",
                  range: "<0.0.6"
                }
              ]
            } as VulnerabilityInfo
          }
        })
      } as unknown as ReturnType<typeof spawnSync>);

      expect(() => runSecurityAudit()).toThrowError("process.exit called with 1");
      expect(exitSpy).toHaveBeenCalledWith(1);

      // Check that redacted warning was logged
      const errorCalls = errorSpy.mock.calls.map((call) => call[0] as string).join("\n");
      expect(errorCalls).toContain("A dependency vulnerability affecting a core layout component has been detected");

      // Check that specific advisory details were NOT logged (private handling invariant)
      expect(errorCalls).not.toContain("Denial of service via extremely long input");
      expect(errorCalls).not.toContain("https://github.com/advisories/GHSA-pretext");
    });
  });
});
