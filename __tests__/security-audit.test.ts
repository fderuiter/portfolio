import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { MockInstance } from "vitest";
import { spawnSync } from "child_process";
import fs from "fs";

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
  parseIgnoreRules,
  runSecurityAudit
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

  describe("parseIgnoreRules", () => {
    const fixedNow = new Date("2026-08-18T12:00:00Z");

    it("parses valid rules with future expiration date and justification", () => {
      const input = [
        {
          package: "concurrently",
          expiresAt: "2027-12-31T23:59:59Z",
          reason: "CLI process runner tool"
        }
      ];
      const rules = parseIgnoreRules(input, fixedNow);
      expect(rules).toHaveLength(1);
      expect(rules[0].package).toBe("concurrently");
      expect(rules[0].isValid).toBe(true);
      expect(rules[0].isExpired).toBe(false);
      expect(rules[0].reason).toBe("CLI process runner tool");
    });

    it("marks rules as invalid if missing expiration date or justification", () => {
      const inputNoExpires = [{ package: "pkg-a", reason: "some reason" }];
      const rulesNoExpires = parseIgnoreRules(inputNoExpires, fixedNow);
      expect(rulesNoExpires[0].isValid).toBe(false);
      expect(rulesNoExpires[0].validationError).toContain("expiration date");

      const inputNoReason = [{ package: "pkg-b", expiresAt: "2027-12-31" }];
      const rulesNoReason = parseIgnoreRules(inputNoReason, fixedNow);
      expect(rulesNoReason[0].isValid).toBe(false);
      expect(rulesNoReason[0].validationError).toContain("business justification");
    });

    it("marks rules as invalid if legacy string format is used", () => {
      const inputLegacy = ["concurrently", "next"];
      const rules = parseIgnoreRules(inputLegacy, fixedNow);
      expect(rules).toHaveLength(2);
      expect(rules[0].isValid).toBe(false);
      expect(rules[0].validationError).toContain("missing expiration date");
    });

    it("marks rules as expired if expiration date is in the past", () => {
      const inputExpired = [
        {
          package: "expired-pkg",
          expiresAt: "2025-01-01T00:00:00Z",
          reason: "Old exception"
        }
      ];
      const rules = parseIgnoreRules(inputExpired, fixedNow);
      expect(rules[0].isValid).toBe(true);
      expect(rules[0].isExpired).toBe(true);
    });
  });

  describe("loadIgnoreList", () => {
    it("returns default ignore list with valid package names", () => {
      const list = loadIgnoreList();
      const pkgNames = list.map((item) => item.package);
      expect(pkgNames).toContain("concurrently");
      expect(pkgNames).toContain("next");
    });
  });

  describe("runSecurityAudit", () => {
    it("should pass when there are no vulnerabilities", () => {
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

    it("should pass when high/critical vulnerabilities have valid, unexpired ignore overrides", () => {
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

    it("should fail when an ignore override is missing expiration date or justification", () => {
      vi.mocked(spawnSync).mockReturnValue({
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: {}
        })
      } as unknown as ReturnType<typeof spawnSync>);

      const invalidRawData = [{ package: "concurrently", reason: "no expires" }];
      vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(invalidRawData));
      vi.spyOn(fs, "existsSync").mockReturnValue(true);

      expect(() => runSecurityAudit()).toThrowError("process.exit called with 1");
      expect(exitSpy).toHaveBeenCalledWith(1);

      const errorCalls = errorSpy.mock.calls.map((call) => call[0] as string).join("\n");
      expect(errorCalls).toContain('Invalid vulnerability override definition for package "concurrently"');
    });

    it("should reject expired vulnerability overrides and fail when vulnerabilities exist", () => {
      vi.mocked(spawnSync).mockReturnValue({
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: {
            "expired-package": {
              name: "expired-package",
              severity: "high",
              via: ["some-dep"]
            }
          }
        })
      } as unknown as ReturnType<typeof spawnSync>);

      const expiredRawData = [
        {
          package: "expired-package",
          expiresAt: "2020-01-01T00:00:00Z",
          reason: "Expired exception"
        }
      ];
      vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(expiredRawData));
      vi.spyOn(fs, "existsSync").mockReturnValue(true);

      expect(() => runSecurityAudit()).toThrowError("process.exit called with 1");
      expect(exitSpy).toHaveBeenCalledWith(1);

      const errorCalls = errorSpy.mock.calls.map((call) => call[0] as string).join("\n");
      expect(errorCalls).toContain('Vulnerability override for "expired-package" expired on 2020-01-01T00:00:00Z. Override rejected.');
    });

    it("should fail when unignored high/critical vulnerabilities exist", () => {
      vi.mocked(spawnSync).mockReturnValue({
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: {
            "unsafe-package": {
              name: "unsafe-package",
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
