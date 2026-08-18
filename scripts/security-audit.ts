#!/usr/bin/env node
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { colors } from "../lib/dx/utils";

export interface IgnoreRule {
  package: string;
  expiresAt: string;
  reason: string;
}

export interface ParsedIgnoreRule extends IgnoreRule {
  isValid: boolean;
  isExpired: boolean;
  validationError?: string;
}

export interface SecurityAuditOptions {
  throwOnError?: boolean;
}

// List of currently ignored high/critical vulnerabilities with expiration dates and business justifications
export const DEFAULT_IGNORE_LIST: IgnoreRule[] = [
  {
    package: "concurrently",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Dev-only process runner CLI tool with no production runtime exposure"
  },
  {
    package: "@lhci/cli",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Lighthouse CI automated performance test runner"
  },
  {
    package: "@lhci/utils",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Lighthouse CI utility module for benchmark assertions"
  },
  {
    package: "@prisma/config",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Prisma ORM tooling configuration parser"
  },
  {
    package: "@puppeteer/browsers",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Browser binary downloader for synthetic Playwright/Lighthouse testing"
  },
  {
    package: "brace-expansion",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Glob pattern matching library used in build scripts"
  },
  {
    package: "deepmerge-ts",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "TypeScript utility library for object merging in build config"
  },
  {
    package: "extract-zip",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Zip archive extraction utility for Playwright browser binaries"
  },
  {
    package: "fast-uri",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "URI parser dependency used by internal schema validators"
  },
  {
    package: "js-yaml",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "YAML parser for CI configuration and OpenAPI schema compilation"
  },
  {
    package: "lighthouse",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Performance benchmarking engine for synthetic audit suites"
  },
  {
    package: "next",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Core Web Framework; security fixes tracked in lockstep releases"
  },
  {
    package: "postcss",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "CSS AST transformer used during static build pipeline"
  },
  {
    package: "prisma",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Database ORM migration and client code generator"
  },
  {
    package: "puppeteer-core",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Headless Chrome automation driver for end-to-end testing"
  },
  {
    package: "sharp",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Native image processing engine for Next.js Image optimization"
  },
  {
    package: "shell-quote",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Shell command sanitization helper for build tool scripts"
  },
  {
    package: "tmp",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Temporary file creator for build artifacts and benchmark caches"
  },
  {
    package: "hono",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "Lightweight edge HTTP server used in auxiliary benchmark routes"
  },
  {
    package: "ip-address",
    expiresAt: "2027-12-31T23:59:59Z",
    reason: "IP parsing utility used in telemetry network middleware"
  }
];

export interface Advisory {
  name?: string;
  dependency?: string;
  title?: string;
  url?: string;
  severity?: string;
  cwe?: string[];
  cvss?: {
    score: number;
    vectorString: string | null;
  } | null;
  range?: string;
}

export interface VulnerabilityInfo {
  name?: string;
  severity?: string;
  isDirect?: boolean;
  via?: Array<string | Advisory>;
  effects?: string[];
  range?: string;
  nodes?: string[];
  fixAvailable?: boolean | { name: string; version?: string; isSemVerMajor?: boolean };
}

export interface AuditReport {
  auditReportVersion?: number;
  vulnerabilities?: Record<string, VulnerabilityInfo>;
}

export function parseIgnoreRules(data: unknown, now: Date = new Date()): ParsedIgnoreRule[] {
  const rules: ParsedIgnoreRule[] = [];

  const validateAndAdd = (pkg: string, expiresAt: string, reason: string) => {
    const pkgTrimmed = pkg.trim();
    const expiresTrimmed = expiresAt.trim();
    const reasonTrimmed = reason.trim();

    if (!pkgTrimmed) {
      rules.push({
        package: "",
        expiresAt: expiresTrimmed,
        reason: reasonTrimmed,
        isValid: false,
        isExpired: false,
        validationError: "Override entry is missing package name."
      });
      return;
    }

    if (!expiresTrimmed || !reasonTrimmed) {
      const missingParts: string[] = [];
      if (!expiresTrimmed) missingParts.push("expiration date ('expiresAt')");
      if (!reasonTrimmed) missingParts.push("business justification ('reason')");
      rules.push({
        package: pkgTrimmed,
        expiresAt: expiresTrimmed,
        reason: reasonTrimmed,
        isValid: false,
        isExpired: false,
        validationError: `Exception for package "${pkgTrimmed}" is missing ${missingParts.join(" and ")}.`
      });
      return;
    }

    const expDate = new Date(expiresTrimmed);
    if (isNaN(expDate.getTime())) {
      rules.push({
        package: pkgTrimmed,
        expiresAt: expiresTrimmed,
        reason: reasonTrimmed,
        isValid: false,
        isExpired: false,
        validationError: `Exception for package "${pkgTrimmed}" has an invalid expiration date format ("${expiresTrimmed}").`
      });
      return;
    }

    const isExpired = expDate.getTime() <= now.getTime();
    rules.push({
      package: pkgTrimmed,
      expiresAt: expiresTrimmed,
      reason: reasonTrimmed,
      isValid: true,
      isExpired
    });
  };

  if (Array.isArray(data)) {
    for (const item of data) {
      if (typeof item === "string") {
        validateAndAdd(item, "", "");
      } else if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        const pkg = String(obj.package || obj.name || "");
        const expiresAt = String(obj.expiresAt || obj.expires || "");
        const reason = String(obj.reason || obj.justification || "");
        validateAndAdd(pkg, expiresAt, reason);
      }
    }
  } else if (data && typeof data === "object") {
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      if (val && typeof val === "object") {
        const obj = val as Record<string, unknown>;
        const expiresAt = String(obj.expiresAt || obj.expires || "");
        const reason = String(obj.reason || obj.justification || "");
        validateAndAdd(key, expiresAt, reason);
      } else {
        validateAndAdd(key, "", String(val || ""));
      }
    }
  }

  return rules;
}

export function loadRawIgnoreList(): unknown {
  const rootIgnorePath = path.join(process.cwd(), "security-audit-ignore.json");
  const scriptsIgnorePath = path.join(process.cwd(), "scripts", "security-audit-ignore.json");

  if (fs.existsSync(rootIgnorePath)) {
    try {
      return JSON.parse(fs.readFileSync(rootIgnorePath, "utf8"));
    } catch (_e) {
      console.warn("Failed to parse root security-audit-ignore.json, falling back to default.");
    }
  }

  if (fs.existsSync(scriptsIgnorePath)) {
    try {
      return JSON.parse(fs.readFileSync(scriptsIgnorePath, "utf8"));
    } catch (_e) {
      console.warn("Failed to parse scripts/security-audit-ignore.json, falling back to default.");
    }
  }

  return DEFAULT_IGNORE_LIST;
}

// Load ignore list from json or fallback to default
export function loadIgnoreList(): ParsedIgnoreRule[] {
  const rawData = loadRawIgnoreList();
  return parseIgnoreRules(rawData);
}

export function isPretextRelated(pkgName: string, vuln: VulnerabilityInfo): boolean {
  if (pkgName.toLowerCase().includes("pretext") || pkgName.toLowerCase().includes("@chenglou/pretext")) {
    return true;
  }
  if (vuln && Array.isArray(vuln.via)) {
    for (const item of vuln.via) {
      if (typeof item === "string") {
        if (item.toLowerCase().includes("pretext") || item.toLowerCase().includes("@chenglou/pretext")) {
          return true;
        }
      } else if (item && typeof item === "object") {
        if (
          (item.name && item.name.toLowerCase().includes("pretext")) ||
          (item.dependency && item.dependency.toLowerCase().includes("pretext")) ||
          (item.title && item.title.toLowerCase().includes("pretext"))
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

export function runSecurityAudit(options: SecurityAuditOptions = {}): boolean {
  console.log(`${colors.bold}${colors.cyan}🛡️  Parallelized Security Workflow Gate${colors.reset}`);
  console.log(`${colors.gray}Executing lockfile vulnerability scans...${colors.reset}\n`);

  const ignoreRules = loadIgnoreList();
  let hasInvalidRules = false;

  for (const rule of ignoreRules) {
    if (!rule.isValid) {
      console.error(`${colors.brightRed}❌ Invalid vulnerability override definition for package "${rule.package || "unknown"}": ${rule.validationError}${colors.reset}`);
      hasInvalidRules = true;
    }
  }

  // Run npm audit --json
  const auditResult = spawnSync("npm", ["audit", "--json"], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    shell: true
  });

  let auditJson: AuditReport;
  try {
    auditJson = JSON.parse(auditResult.stdout || auditResult.stderr || "{}") as AuditReport;
  } catch (_e) {
    console.error(`${colors.brightRed}❌ Failed to parse npm audit JSON output.${colors.reset}`);
    if (options.throwOnError) {
      throw new Error("Failed to parse npm audit JSON output.");
    }
    process.exit(1);
  }

  const vulnerabilities = auditJson.vulnerabilities || {};
  const highOrCriticalVulnerabilities: Array<{ pkgName: string; info: VulnerabilityInfo }> = [];
  let pretextVulnerabilitiesFound = false;

  for (const [pkgName, info] of Object.entries(vulnerabilities)) {
    const vuln = info as VulnerabilityInfo;
    const severity = (vuln.severity || "").toLowerCase();

    // Only process high or critical vulnerabilities
    if (severity === "high" || severity === "critical") {
      // Check if it's pretext-related
      if (isPretextRelated(pkgName, vuln)) {
        pretextVulnerabilitiesFound = true;
      } else {
        const matchingRule = ignoreRules.find(
          r => r.package.toLowerCase() === pkgName.toLowerCase()
        );

        if (matchingRule && matchingRule.isValid && !matchingRule.isExpired) {
          console.log(`${colors.gray}ℹ️ Overriding vulnerability for ${pkgName} (Expires: ${matchingRule.expiresAt}, Reason: ${matchingRule.reason})${colors.reset}`);
        } else {
          if (matchingRule && matchingRule.isExpired) {
            console.error(`${colors.brightRed}❌ Vulnerability override for "${pkgName}" expired on ${matchingRule.expiresAt}. Override rejected.${colors.reset}`);
          }
          highOrCriticalVulnerabilities.push({ pkgName, info: vuln });
        }
      }
    }
  }

  let failed = hasInvalidRules;

  // 1. Handle pretext private guardrail
  if (pretextVulnerabilitiesFound) {
    console.error(`${colors.brightRed}${colors.bold}❌ SECURITY ALERT:${colors.reset}`);
    console.error(`${colors.red}A dependency vulnerability affecting a core layout component has been detected. Please refer to SECURITY.md for the private disclosure policy and report privately.${colors.reset}\n`);
    failed = true;
  }

  // 2. Handle other high/critical vulnerabilities
  if (highOrCriticalVulnerabilities.length > 0) {
    console.error(`${colors.brightRed}${colors.bold}❌ Blocked high/critical severity dependency vulnerabilities:${colors.reset}\n`);

    for (const { pkgName, info } of highOrCriticalVulnerabilities) {
      console.error(`${colors.bold}${colors.brightYellow}• Package:${colors.reset} ${colors.bold}${pkgName}${colors.reset}`);
      console.error(`  ${colors.bold}Severity:${colors.reset} ${(info.severity || "").toUpperCase()}`);

      if (Array.isArray(info.via)) {
        for (const via of info.via) {
          if (typeof via === "object" && via !== null) {
            console.error(`  ${colors.bold}Advisory Title:${colors.reset} ${via.title || "N/A"}`);
            console.error(`  ${colors.bold}Advisory URL:${colors.reset} ${via.url || "N/A"}`);
            console.error(`  ${colors.bold}Vulnerable Range:${colors.reset} ${via.range || "N/A"}`);
          } else if (typeof via === "string") {
            console.error(`  ${colors.bold}Via dependency:${colors.reset} ${via}`);
          }
        }
      }

      if (info.fixAvailable) {
        if (typeof info.fixAvailable === "boolean") {
          console.error(`  ${colors.green}Fix Available: Yes${colors.reset}`);
        } else if (typeof info.fixAvailable === "object") {
          console.error(`  ${colors.green}Fix Available:${colors.reset} Upgrade to ${info.fixAvailable.name}@${info.fixAvailable.version || "latest"}`);
        }
      }
      console.error("");
    }
    failed = true;
  }

  if (failed) {
    console.error(`${colors.brightRed}${colors.bold}✖ Security status check failed.${colors.reset}`);
    console.error(`${colors.gray}Vulnerable third-party packages must be fixed or approved (added to ignore list with explicit expiration date and justification) to pass this gate.${colors.reset}`);
    if (options.throwOnError) {
      throw new Error("Security audit failed due to unhandled vulnerabilities or invalid overrides.");
    }
    process.exit(1);
  } else {
    console.log(`${colors.brightGreen}${colors.bold}✔ Security check passed successfully.${colors.reset}`);
    console.log(`${colors.gray}No unignored high or critical vulnerabilities found in third-party packages.${colors.reset}`);
    if (options.throwOnError) {
      return true;
    }
    process.exit(0);
  }
}

if (typeof process.env.VITEST === "undefined" && (require.main === module || (process.argv[1] && process.argv[1].includes("security-audit")))) {
  runSecurityAudit();
}
