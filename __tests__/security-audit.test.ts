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
  runSecurityAudit,
  collectAdvisoriesForVulnerability,
  matchAdvisoryRule
} from "../scripts/security-audit";
import type { VulnerabilityInfo, ParsedIgnoreRule, Advisory } from "../scripts/security-audit";

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

    it("parses valid rules with explicit advisory ID, future expiration date <= 90 days, and justification", () => {
      const input = [
        {
          advisory: "GHSA-c2qf-rxjj-4v5w",
          package: "concurrently",
          expiresAt: "2026-10-15T23:59:59Z",
          reason: "CLI process runner tool"
        }
      ];
      const rules = parseIgnoreRules(input, fixedNow);
      expect(rules).toHaveLength(1);
      expect(rules[0].advisory).toBe("GHSA-c2qf-rxjj-4v5w");
      expect(rules[0].package).toBe("concurrently");
      expect(rules[0].isValid).toBe(true);
      expect(rules[0].isExpired).toBe(false);
      expect(rules[0].reason).toBe("CLI process runner tool");
      expect(rules[0].remainingDays).toBeGreaterThan(0);
    });

    it("marks rules as invalid if missing advisory ID", () => {
      const inputNoAdvisory = [
        {
          package: "concurrently",
          expiresAt: "2026-10-15T23:59:59Z",
          reason: "some reason"
        }
      ];
      const rules = parseIgnoreRules(inputNoAdvisory, fixedNow);
      expect(rules[0].isValid).toBe(false);
      expect(rules[0].validationError).toContain("missing a valid advisory ID");
    });

    it("marks rules as invalid if expiration date exceeds 90-day cap", () => {
      const inputExceedsCap = [
        {
          advisory: "GHSA-c2qf-rxjj-4v5w",
          package: "concurrently",
          expiresAt: "2027-12-31T23:59:59Z",
          reason: "Distant expiration date"
        }
      ];
      const rules = parseIgnoreRules(inputExceedsCap, fixedNow);
      expect(rules[0].isValid).toBe(false);
      expect(rules[0].validationError).toContain("exceeds the maximum 90-day lifespan");
    });

    it("marks rules as invalid if missing expiration date or justification", () => {
      const inputNoExpires = [{ advisory: "GHSA-1234", package: "pkg-a", reason: "some reason" }];
      const rulesNoExpires = parseIgnoreRules(inputNoExpires, fixedNow);
      expect(rulesNoExpires[0].isValid).toBe(false);
      expect(rulesNoExpires[0].validationError).toContain("expiration date");

      const inputNoReason = [{ advisory: "GHSA-1234", package: "pkg-b", expiresAt: "2026-10-15" }];
      const rulesNoReason = parseIgnoreRules(inputNoReason, fixedNow);
      expect(rulesNoReason[0].isValid).toBe(false);
      expect(rulesNoReason[0].validationError).toContain("business justification");
    });

    it("marks rules as invalid if legacy string format is used", () => {
      const inputLegacy = ["concurrently", "next"];
      const rules = parseIgnoreRules(inputLegacy, fixedNow);
      expect(rules).toHaveLength(2);
      expect(rules[0].isValid).toBe(false);
      expect(rules[0].validationError).toContain("missing a valid advisory ID");
    });

    it("marks rules as expired if expiration date is in the past", () => {
      const inputExpired = [
        {
          advisory: "GHSA-expired-1234",
          package: "expired-pkg",
          expiresAt: "2025-01-01T00:00:00Z",
          reason: "Old exception"
        }
      ];
      const rules = parseIgnoreRules(inputExpired, fixedNow);
      expect(rules[0].isValid).toBe(true);
      expect(rules[0].isExpired).toBe(true);
      expect(rules[0].remainingDays).toBe(0);
    });
  });

  describe("collectAdvisoriesForVulnerability & matchAdvisoryRule", () => {
    it("evaluates nested advisory records across package dependency references", () => {
      const vulnerabilities: Record<string, VulnerabilityInfo> = {
        "@lhci/cli": {
          name: "@lhci/cli",
          severity: "high",
          via: ["extract-zip"]
        },
        "extract-zip": {
          name: "extract-zip",
          severity: "high",
          via: [
            {
              source: 1139346,
              name: "extract-zip",
              url: "https://github.com/advisories/GHSA-jmr9-qjv8-65gv",
              title: "extract-zip unvalidated symlink path traversal"
            } as Advisory
          ]
        }
      };

      const advisories = collectAdvisoriesForVulnerability("@lhci/cli", vulnerabilities);
      expect(advisories).toHaveLength(1);
      expect(advisories[0].url).toContain("GHSA-jmr9-qjv8-65gv");

      const rule: ParsedIgnoreRule = {
        advisory: "GHSA-jmr9-qjv8-65gv",
        expiresAt: "2026-10-15T00:00:00Z",
        reason: "Test exception",
        isValid: true,
        isExpired: false
      };

      expect(matchAdvisoryRule(rule, advisories[0], "@lhci/cli")).toBe(true);
    });
  });

  describe("loadIgnoreList", () => {
    it("returns ignore list with valid advisory IDs and package names", () => {
      const fixedNow = new Date("2026-08-19T12:00:00Z");
      const list = loadIgnoreList(fixedNow);
      const advisories = list.map((item) => item.advisory);
      expect(advisories).toContain("GHSA-c2qf-rxjj-4v5w");
      expect(advisories).toContain("GHSA-953w-3q36-93rf");
    });
  });

  describe("runSecurityAudit", () => {
    const testNow = new Date("2026-08-19T12:00:00Z");

    it("should pass when there are no vulnerabilities", () => {
      vi.mocked(spawnSync).mockReturnValue({
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: {}
        })
      } as unknown as ReturnType<typeof spawnSync>);

      expect(() => runSecurityAudit({ now: testNow })).toThrowError("process.exit called with 0");
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

      expect(() => runSecurityAudit({ now: testNow })).toThrowError("process.exit called with 0");
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it("should pass when high/critical vulnerabilities match a valid, active advisory ignore rule", () => {
      vi.mocked(spawnSync).mockReturnValue({
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: {
            concurrently: {
              name: "concurrently",
              severity: "critical",
              via: [
                {
                  source: "GHSA-c2qf-rxjj-4v5w",
                  title: "Command Injection",
                  url: "https://github.com/advisories/GHSA-c2qf-rxjj-4v5w"
                }
              ]
            }
          }
        })
      } as unknown as ReturnType<typeof spawnSync>);

      const validRawData = [
        {
          advisory: "GHSA-c2qf-rxjj-4v5w",
          package: "concurrently",
          expiresAt: "2026-10-31T23:59:59Z",
          reason: "CLI runner tool"
        }
      ];
      vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(validRawData));
      vi.spyOn(fs, "existsSync").mockReturnValue(true);

      expect(() => runSecurityAudit({ now: testNow })).toThrowError("process.exit called with 0");
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it("should fail when vulnerabilities match an unlisted advisory ID on an ignored package", () => {
      vi.mocked(spawnSync).mockReturnValue({
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: {
            concurrently: {
              name: "concurrently",
              severity: "high",
              via: [
                {
                  source: "GHSA-unlisted-advisory-999",
                  title: "Unlisted Remote Code Execution",
                  url: "https://github.com/advisories/GHSA-unlisted-advisory-999"
                }
              ]
            }
          }
        })
      } as unknown as ReturnType<typeof spawnSync>);

      const validRawData = [
        {
          advisory: "GHSA-c2qf-rxjj-4v5w",
          package: "concurrently",
          expiresAt: "2026-10-31T23:59:59Z",
          reason: "CLI runner tool"
        }
      ];
      vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(validRawData));
      vi.spyOn(fs, "existsSync").mockReturnValue(true);

      expect(() => runSecurityAudit({ now: testNow })).toThrowError("process.exit called with 1");
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it("should fail when an ignore override is missing an advisory ID", () => {
      vi.mocked(spawnSync).mockReturnValue({
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: {}
        })
      } as unknown as ReturnType<typeof spawnSync>);

      const invalidRawData = [{ package: "concurrently", expiresAt: "2026-10-31T23:59:59Z", reason: "no advisory" }];
      vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(invalidRawData));
      vi.spyOn(fs, "existsSync").mockReturnValue(true);

      expect(() => runSecurityAudit({ now: testNow })).toThrowError("process.exit called with 1");
      expect(exitSpy).toHaveBeenCalledWith(1);

      const errorCalls = errorSpy.mock.calls.map((call) => call[0] as string).join("\n");
      expect(errorCalls).toContain("missing a valid advisory ID");
    });

    it("should fail when an ignore override sets an expiration date greater than 90 days in the future", () => {
      vi.mocked(spawnSync).mockReturnValue({
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: {}
        })
      } as unknown as ReturnType<typeof spawnSync>);

      const invalidRawData = [
        {
          advisory: "GHSA-c2qf-rxjj-4v5w",
          package: "concurrently",
          expiresAt: "2027-12-31T23:59:59Z",
          reason: "Exceeds 90-day cap"
        }
      ];
      vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(invalidRawData));
      vi.spyOn(fs, "existsSync").mockReturnValue(true);

      expect(() => runSecurityAudit({ now: testNow })).toThrowError("process.exit called with 1");
      expect(exitSpy).toHaveBeenCalledWith(1);

      const errorCalls = errorSpy.mock.calls.map((call) => call[0] as string).join("\n");
      expect(errorCalls).toContain("exceeds the maximum 90-day lifespan");
    });

    it("should reject expired vulnerability overrides and fail when vulnerabilities exist", () => {
      vi.mocked(spawnSync).mockReturnValue({
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: {
            "expired-package": {
              name: "expired-package",
              severity: "high",
              via: [
                {
                  source: "GHSA-expired-1111",
                  url: "https://github.com/advisories/GHSA-expired-1111"
                }
              ]
            }
          }
        })
      } as unknown as ReturnType<typeof spawnSync>);

      const expiredRawData = [
        {
          advisory: "GHSA-expired-1111",
          package: "expired-package",
          expiresAt: "2020-01-01T00:00:00Z",
          reason: "Expired exception"
        }
      ];
      vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(expiredRawData));
      vi.spyOn(fs, "existsSync").mockReturnValue(true);

      expect(() => runSecurityAudit({ now: testNow })).toThrowError("process.exit called with 1");
      expect(exitSpy).toHaveBeenCalledWith(1);

      const errorCalls = errorSpy.mock.calls.map((call) => call[0] as string).join("\n");
      expect(errorCalls).toContain('Vulnerability override for advisory "GHSA-expired-1111" expired on 2020-01-01T00:00:00Z. Override rejected.');
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

      expect(() => runSecurityAudit({ now: testNow })).toThrowError("process.exit called with 1");
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

      expect(() => runSecurityAudit({ now: testNow })).toThrowError("process.exit called with 1");
      expect(exitSpy).toHaveBeenCalledWith(1);

      const errorCalls = errorSpy.mock.calls.map((call) => call[0] as string).join("\n");
      expect(errorCalls).toContain("A dependency vulnerability affecting a core layout component has been detected");
      expect(errorCalls).not.toContain("Denial of service via extremely long input");
      expect(errorCalls).not.toContain("https://github.com/advisories/GHSA-pretext");
    });
  });
});
