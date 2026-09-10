#!/usr/bin/env node
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { colors } from "../lib/dx/utils";

export interface IgnoreRule {
  advisory?: string;
  advisoryId?: string;
  cve?: string;
  ghsa?: string;
  id?: string;
  package?: string;
  name?: string;
  expiresAt: string;
  createdAt?: string;
  reason: string;
}

export interface ParsedIgnoreRule {
  advisory: string;
  package?: string;
  expiresAt: string;
  createdAt?: string;
  reason: string;
  isValid: boolean;
  isExpired: boolean;
  remainingDays?: number;
  validationError?: string;
}

export interface SecurityAuditOptions {
  throwOnError?: boolean;
  now?: Date;
}

// List of currently ignored high/critical vulnerabilities with explicit advisory IDs, expiration dates, and business justifications
export const DEFAULT_IGNORE_LIST: IgnoreRule[] = [
  {
    advisory: "GHSA-c2qf-rxjj-4v5w",
    package: "concurrently",
    expiresAt: "2026-11-01T23:59:59Z",
    reason:
      "Dev-only process runner CLI tool with no production runtime exposure",
  },
  {
    advisory: "GHSA-725w-8224-vh33",
    package: "@lhci/cli",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Lighthouse CI automated performance test runner",
  },
  {
    advisory: "GHSA-725w-8224-vh33",
    package: "@lhci/utils",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Lighthouse CI utility module for benchmark assertions",
  },
  {
    advisory: "GHSA-qq97-3p32-359f",
    package: "@prisma/config",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Prisma ORM tooling configuration parser",
  },
  {
    advisory: "GHSA-566m-v2pf-453b",
    package: "@puppeteer/browsers",
    expiresAt: "2026-11-01T23:59:59Z",
    reason:
      "Browser binary downloader for synthetic Playwright/Lighthouse testing",
  },
  {
    advisory: "GHSA-v88g-83jp-hd2w",
    package: "brace-expansion",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Glob pattern matching library used in build scripts",
  },
  {
    advisory: "GHSA-3xvc-62x2-3635",
    package: "deepmerge-ts",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "TypeScript utility library for object merging in build config",
  },
  {
    advisory: "GHSA-jmr9-qjv8-65gv",
    package: "extract-zip",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Zip archive extraction utility for Playwright browser binaries",
  },
  {
    advisory: "GHSA-3rjg-36vw-hh7p",
    package: "fast-uri",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "URI parser dependency used by internal schema validators",
  },
  {
    advisory: "GHSA-52cp-r559-cp3m",
    package: "js-yaml",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "YAML parser for CI configuration and OpenAPI schema compilation",
  },
  {
    advisory: "GHSA-5p4m-2wfm-xmqj",
    package: "js-yaml",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "YAML parser for CI configuration and OpenAPI schema compilation",
  },
  {
    advisory: "GHSA-h67p-54hq-rp68",
    package: "js-yaml",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "YAML parser for CI configuration and OpenAPI schema compilation",
  },
  {
    advisory: "GHSA-725w-8224-vh33",
    package: "lighthouse",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Performance benchmarking engine for synthetic audit suites",
  },
  {
    advisory: "GHSA-953w-3q36-93rf",
    package: "next",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Core Web Framework; security fixes tracked in lockstep releases",
  },
  {
    advisory: "GHSA-7fh5-64p2-3v2j",
    package: "postcss",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "CSS AST transformer used during static build pipeline",
  },
  {
    advisory: "GHSA-qq97-3p32-359f",
    package: "prisma",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Database ORM migration and client code generator",
  },
  {
    advisory: "GHSA-566m-v2pf-453b",
    package: "puppeteer-core",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Headless Chrome automation driver for end-to-end testing",
  },
  {
    advisory: "GHSA-54xr-2vhv-28v8",
    package: "sharp",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Native image processing engine for Next.js Image optimization",
  },
  {
    advisory: "GHSA-c2qf-rxjj-4v5w",
    package: "shell-quote",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Shell command sanitization helper for build tool scripts",
  },
  {
    advisory: "GHSA-ph9p-34f9-6g65",
    package: "tmp",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Temporary file creator for build artifacts and benchmark caches",
  },
  {
    advisory: "GHSA-52f5-9888-hmc6",
    package: "tmp",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Temporary file creator for build artifacts and benchmark caches",
  },
  {
    advisory: "GHSA-2rmq-5992-prm2",
    package: "hono",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Lightweight edge HTTP server used in auxiliary benchmark routes",
  },
  {
    advisory: "GHSA-mwp4-54f8-5fhr",
    package: "ip-address",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "IP parsing utility used in telemetry network middleware",
  },
  {
    advisory: "GHSA-v2v4-37r5-5v8g",
    package: "ip-address",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "IP parsing utility used in telemetry network middleware",
  },
  {
    advisory: "GHSA-w5hq-g745-h8pq",
    package: "uuid",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "UUID generator dependency used in lighthouse runner",
  },
  {
    advisory: "GHSA-7pqw-9j4j-h8q3",
    package: "@lhci/cli",
    expiresAt: "2026-11-01T23:59:59Z",
    reason:
      "Lighthouse CI automated performance test runner; zip archive symlink write not exploitable in CI",
  },
  {
    advisory: "GHSA-7pqw-9j4j-h8q3",
    package: "@lhci/utils",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Lighthouse CI utility module for benchmark assertions",
  },
  {
    advisory: "GHSA-7pqw-9j4j-h8q3",
    package: "@puppeteer/browsers",
    expiresAt: "2026-11-01T23:59:59Z",
    reason:
      "Browser binary downloader for synthetic Playwright/Lighthouse testing",
  },
  {
    advisory: "GHSA-7pqw-9j4j-h8q3",
    package: "extract-zip",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Zip archive extraction utility for Playwright browser binaries",
  },
  {
    advisory: "GHSA-7pqw-9j4j-h8q3",
    package: "lighthouse",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Performance benchmarking engine for synthetic audit suites",
  },
  {
    advisory: "GHSA-7pqw-9j4j-h8q3",
    package: "puppeteer-core",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "Headless Chrome automation driver for end-to-end testing",
  },
  {
    advisory: "GHSA-2883-xcg3-v3hh",
    package: "js-yaml",
    expiresAt: "2026-11-01T23:59:59Z",
    reason: "YAML parser for CI configuration and OpenAPI schema compilation",
  },
];

export interface Advisory {
  source?: number | string;
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
  fixAvailable?:
    boolean | { name: string; version?: string; isSemVerMajor?: boolean };
}

export interface AuditReport {
  auditReportVersion?: number;
  vulnerabilities?: Record<string, VulnerabilityInfo>;
}

export function parseIgnoreRules(
  data: unknown,
  now: Date = new Date()
): ParsedIgnoreRule[] {
  const rules: ParsedIgnoreRule[] = [];
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

  const validateAndAdd = (
    advisoryRaw: string,
    pkgRaw: string,
    expiresAtRaw: string,
    reasonRaw: string,
    createdAtRaw?: string
  ) => {
    const advisory = advisoryRaw.trim();
    const pkg = pkgRaw.trim();
    const expiresAt = expiresAtRaw.trim();
    const reason = reasonRaw.trim();
    const createdAt = createdAtRaw ? createdAtRaw.trim() : undefined;

    if (!advisory) {
      rules.push({
        advisory: "",
        package: pkg || undefined,
        expiresAt,
        createdAt,
        reason,
        isValid: false,
        isExpired: false,
        validationError: `Override entry ${pkg ? `for package "${pkg}" ` : ""}is missing a valid advisory ID ("advisory" or "cve").`,
      });
      return;
    }

    if (!expiresAt || !reason) {
      const missingParts: string[] = [];
      if (!expiresAt) missingParts.push("expiration date ('expiresAt')");
      if (!reason) missingParts.push("business justification ('reason')");
      rules.push({
        advisory,
        package: pkg || undefined,
        expiresAt,
        createdAt,
        reason,
        isValid: false,
        isExpired: false,
        validationError: `Exception for advisory "${advisory}" is missing ${missingParts.join(" and ")}.`,
      });
      return;
    }

    const expDate = new Date(expiresAt);
    if (isNaN(expDate.getTime())) {
      rules.push({
        advisory,
        package: pkg || undefined,
        expiresAt,
        createdAt,
        reason,
        isValid: false,
        isExpired: false,
        validationError: `Exception for advisory "${advisory}" has an invalid expiration date format ("${expiresAt}").`,
      });
      return;
    }

    let createdDate: Date | undefined;
    if (createdAt) {
      createdDate = new Date(createdAt);
      if (isNaN(createdDate.getTime())) {
        rules.push({
          advisory,
          package: pkg || undefined,
          expiresAt,
          createdAt,
          reason,
          isValid: false,
          isExpired: false,
          validationError: `Exception for advisory "${advisory}" has an invalid creation date format ("${createdAt}").`,
        });
        return;
      }
    }

    if (expDate.getTime() > now.getTime() + ninetyDaysMs) {
      rules.push({
        advisory,
        package: pkg || undefined,
        expiresAt,
        createdAt,
        reason,
        isValid: false,
        isExpired: false,
        validationError: `Expiration date for advisory "${advisory}" exceeds the maximum 90-day lifespan (${expiresAt}).`,
      });
      return;
    }

    if (
      createdDate &&
      expDate.getTime() > createdDate.getTime() + ninetyDaysMs
    ) {
      rules.push({
        advisory,
        package: pkg || undefined,
        expiresAt,
        createdAt,
        reason,
        isValid: false,
        isExpired: false,
        validationError: `Expiration date for advisory "${advisory}" exceeds 90 days from creation date (${expiresAt}).`,
      });
      return;
    }

    const isExpired = expDate.getTime() <= now.getTime();
    const remainingDays = isExpired
      ? 0
      : Math.ceil((expDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    rules.push({
      advisory,
      package: pkg || undefined,
      expiresAt,
      createdAt,
      reason,
      isValid: true,
      isExpired,
      remainingDays,
    });
  };

  if (Array.isArray(data)) {
    for (const item of data) {
      if (typeof item === "string") {
        validateAndAdd("", item, "", "");
      } else if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        const advisory = String(
          obj.advisory || obj.advisoryId || obj.cve || obj.ghsa || obj.id || ""
        );
        const pkg = String(obj.package || obj.name || "");
        const expiresAt = String(obj.expiresAt || obj.expires || "");
        const reason = String(obj.reason || obj.justification || "");
        const createdAt =
          obj.createdAt || obj.created
            ? String(obj.createdAt || obj.created)
            : undefined;
        validateAndAdd(advisory, pkg, expiresAt, reason, createdAt);
      }
    }
  } else if (data && typeof data === "object") {
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      if (val && typeof val === "object") {
        const obj = val as Record<string, unknown>;
        const advisory = String(
          obj.advisory || obj.advisoryId || obj.cve || obj.ghsa || obj.id || key
        );
        const pkg = String(obj.package || obj.name || "");
        const expiresAt = String(obj.expiresAt || obj.expires || "");
        const reason = String(obj.reason || obj.justification || "");
        const createdAt =
          obj.createdAt || obj.created
            ? String(obj.createdAt || obj.created)
            : undefined;
        validateAndAdd(advisory, pkg, expiresAt, reason, createdAt);
      }
    }
  }

  return rules;
}

export function loadRawIgnoreList(): unknown {
  const rootIgnorePath = path.join(process.cwd(), "security-audit-ignore.json");
  const scriptsIgnorePath = path.join(
    process.cwd(),
    "scripts",
    "security-audit-ignore.json"
  );

  if (fs.existsSync(rootIgnorePath)) {
    try {
      return JSON.parse(fs.readFileSync(rootIgnorePath, "utf8"));
    } catch (_e) {
      console.warn(
        "Failed to parse root security-audit-ignore.json, falling back to default."
      );
    }
  }

  if (fs.existsSync(scriptsIgnorePath)) {
    try {
      return JSON.parse(fs.readFileSync(scriptsIgnorePath, "utf8"));
    } catch (_e) {
      console.warn(
        "Failed to parse scripts/security-audit-ignore.json, falling back to default."
      );
    }
  }

  return DEFAULT_IGNORE_LIST;
}

export function loadIgnoreList(now: Date = new Date()): ParsedIgnoreRule[] {
  const rawData = loadRawIgnoreList();
  return parseIgnoreRules(rawData, now);
}

export function isPretextRelated(
  pkgName: string,
  vuln: VulnerabilityInfo
): boolean {
  if (
    pkgName.toLowerCase().includes("pretext") ||
    pkgName.toLowerCase().includes("@chenglou/pretext")
  ) {
    return true;
  }
  if (vuln && Array.isArray(vuln.via)) {
    for (const item of vuln.via) {
      if (typeof item === "string") {
        if (
          item.toLowerCase().includes("pretext") ||
          item.toLowerCase().includes("@chenglou/pretext")
        ) {
          return true;
        }
      } else if (item && typeof item === "object") {
        if (
          (item.name && item.name.toLowerCase().includes("pretext")) ||
          (item.dependency &&
            item.dependency.toLowerCase().includes("pretext")) ||
          (item.title && item.title.toLowerCase().includes("pretext"))
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

export function getAdvisoryIdentifiers(adv: Advisory): string[] {
  const ids = new Set<string>();

  if (adv.source !== undefined && adv.source !== null) {
    ids.add(String(adv.source).trim().toLowerCase());
  }

  const anyAdv = adv as Record<string, unknown>;
  const rawId =
    anyAdv.id ||
    anyAdv.advisoryId ||
    anyAdv.advisory ||
    anyAdv.ghsa ||
    anyAdv.ghsaId ||
    anyAdv.cve;
  if (rawId) {
    if (Array.isArray(rawId)) {
      rawId.forEach((i) => ids.add(String(i).trim().toLowerCase()));
    } else {
      ids.add(String(rawId).trim().toLowerCase());
    }
  }

  if (adv.url) {
    const urlStr = adv.url.toLowerCase();
    ids.add(urlStr);
    const ghsaMatches = urlStr.match(/ghsa-[a-z0-9-]+/g);
    if (ghsaMatches) ghsaMatches.forEach((m) => ids.add(m));
    const cveMatches = urlStr.match(/cve-\d{4}-\d+/g);
    if (cveMatches) cveMatches.forEach((m) => ids.add(m));
    const advNumMatches = urlStr.match(/advisories\/(\d+)/g);
    if (advNumMatches)
      advNumMatches.forEach((m) => ids.add(m.replace("advisories/", "")));
  }

  if (adv.title) {
    const titleStr = adv.title.toLowerCase();
    const ghsaMatches = titleStr.match(/ghsa-[a-z0-9-]+/g);
    if (ghsaMatches) ghsaMatches.forEach((m) => ids.add(m));
    const cveMatches = titleStr.match(/cve-\d{4}-\d+/g);
    if (cveMatches) cveMatches.forEach((m) => ids.add(m));
  }

  return Array.from(ids);
}

export function collectAdvisoriesForVulnerability(
  pkgName: string,
  vulnerabilities: Record<string, VulnerabilityInfo>,
  visited = new Set<string>()
): Advisory[] {
  if (visited.has(pkgName)) return [];
  visited.add(pkgName);

  const vuln = vulnerabilities[pkgName];
  if (!vuln) return [];

  const advisories: Advisory[] = [];

  if (Array.isArray(vuln.via)) {
    for (const item of vuln.via) {
      if (typeof item === "object" && item !== null) {
        advisories.push(item as Advisory);
      } else if (typeof item === "string") {
        const nested = collectAdvisoriesForVulnerability(
          item,
          vulnerabilities,
          visited
        );
        advisories.push(...nested);
      }
    }
  }

  if (advisories.length === 0) {
    advisories.push({
      name: vuln.name || pkgName,
      range: vuln.range,
      severity: vuln.severity,
    });
  }

  return advisories;
}

export function matchAdvisoryRule(
  rule: ParsedIgnoreRule,
  adv: Advisory,
  pkgName: string
): boolean {
  if (!rule.isValid || rule.isExpired) return false;

  if (rule.package) {
    const rulePkg = rule.package.trim().toLowerCase();
    const matchesPkg =
      pkgName.toLowerCase() === rulePkg ||
      (adv.name && adv.name.toLowerCase() === rulePkg) ||
      (adv.dependency && adv.dependency.toLowerCase() === rulePkg);
    if (!matchesPkg) return false;
  }

  const ruleAdv = rule.advisory.trim().toLowerCase();
  const ids = getAdvisoryIdentifiers(adv);

  if (ids.includes(ruleAdv)) return true;
  if (adv.url && adv.url.toLowerCase().includes(ruleAdv)) return true;
  if (adv.title && adv.title.toLowerCase().includes(ruleAdv)) return true;
  if (adv.source && String(adv.source).toLowerCase().includes(ruleAdv))
    return true;

  return false;
}

export function runSecurityAudit(options: SecurityAuditOptions = {}): boolean {
  console.log(
    `${colors.bold}${colors.cyan}🛡️  Parallelized Security Workflow Gate${colors.reset}`
  );
  console.log(
    `${colors.gray}Executing lockfile vulnerability scans...${colors.reset}\n`
  );

  const now = options.now || new Date();
  const ignoreRules = loadIgnoreList(now);
  let hasInvalidRules = false;
  let hasExpiredRules = false;

  for (const rule of ignoreRules) {
    if (!rule.isValid) {
      console.error(
        `${colors.brightRed}❌ Invalid vulnerability override definition for advisory "${
          rule.advisory || rule.package || "unknown"
        }": ${rule.validationError}${colors.reset}`
      );
      hasInvalidRules = true;
    } else if (rule.isExpired) {
      console.error(
        `${colors.brightRed}❌ Vulnerability override for advisory "${rule.advisory}" expired on ${rule.expiresAt}. Override rejected.${colors.reset}`
      );
      hasExpiredRules = true;
    } else {
      console.log(
        `${colors.gray}ℹ️ Active override rule: Advisory ${rule.advisory} (${rule.remainingDays} days remaining, Package: ${
          rule.package || "all"
        }, Reason: ${rule.reason})${colors.reset}`
      );
    }
  }

  const auditResult = spawnSync("npm", ["audit", "--json"], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    shell: true,
  });

  let auditJson: AuditReport;
  try {
    auditJson = JSON.parse(
      auditResult.stdout || auditResult.stderr || "{}"
    ) as AuditReport;
  } catch (_e) {
    console.error(
      `${colors.brightRed}❌ Failed to parse npm audit JSON output.${colors.reset}`
    );
    if (options.throwOnError) {
      throw new Error("Failed to parse npm audit JSON output.");
    }
    process.exit(1);
  }

  const vulnerabilities = auditJson.vulnerabilities || {};
  const unhandledVulnerabilities: Array<{
    pkgName: string;
    info: VulnerabilityInfo;
    advisory: Advisory;
  }> = [];
  let pretextVulnerabilitiesFound = false;

  for (const [pkgName, info] of Object.entries(vulnerabilities)) {
    const vuln = info as VulnerabilityInfo;
    const severity = (vuln.severity || "").toLowerCase();

    if (severity === "high" || severity === "critical") {
      if (isPretextRelated(pkgName, vuln)) {
        pretextVulnerabilitiesFound = true;
      } else {
        const advisories = collectAdvisoriesForVulnerability(
          pkgName,
          vulnerabilities
        );

        for (const adv of advisories) {
          const matchingRule = ignoreRules.find((r) =>
            matchAdvisoryRule(r, adv, pkgName)
          );

          if (matchingRule) {
            console.log(
              `${colors.gray}ℹ️ Overriding vulnerability for ${pkgName} / Advisory ${matchingRule.advisory} (Expires: ${matchingRule.expiresAt}, Remaining: ${matchingRule.remainingDays} days, Reason: ${matchingRule.reason})${colors.reset}`
            );
          } else {
            unhandledVulnerabilities.push({
              pkgName,
              info: vuln,
              advisory: adv,
            });
          }
        }
      }
    }
  }

  let failed = hasInvalidRules || hasExpiredRules;

  if (pretextVulnerabilitiesFound) {
    console.error(
      `${colors.brightRed}${colors.bold}❌ SECURITY ALERT:${colors.reset}`
    );
    console.error(
      `${colors.red}A dependency vulnerability affecting a core layout component has been detected. Please refer to SECURITY.md for the private disclosure policy and report privately.${colors.reset}\n`
    );
    failed = true;
  }

  const seenUnhandled = new Set<string>();
  const uniqueUnhandled = unhandledVulnerabilities.filter((item) => {
    const advId = item.advisory
      ? getAdvisoryIdentifiers(item.advisory)[0] || item.advisory.title || "N/A"
      : "N/A";
    const key = `${item.pkgName}:${advId}`;
    if (seenUnhandled.has(key)) return false;
    seenUnhandled.add(key);
    return true;
  });

  if (uniqueUnhandled.length > 0) {
    console.error(
      `${colors.brightRed}${colors.bold}❌ Blocked high/critical severity dependency vulnerabilities:${colors.reset}\n`
    );

    for (const { pkgName, info, advisory } of uniqueUnhandled) {
      console.error(
        `${colors.bold}${colors.brightYellow}• Package:${colors.reset} ${colors.bold}${pkgName}${colors.reset}`
      );
      console.error(
        `  ${colors.bold}Severity:${colors.reset} ${(info.severity || "").toUpperCase()}`
      );
      if (advisory) {
        const advId =
          getAdvisoryIdentifiers(advisory)[0] || advisory.title || "N/A";
        console.error(`  ${colors.bold}Advisory ID:${colors.reset} ${advId}`);
        console.error(
          `  ${colors.bold}Advisory Title:${colors.reset} ${advisory.title || "N/A"}`
        );
        console.error(
          `  ${colors.bold}Advisory URL:${colors.reset} ${advisory.url || "N/A"}`
        );
        console.error(
          `  ${colors.bold}Vulnerable Range:${colors.reset} ${advisory.range || "N/A"}`
        );
      }
      console.error("");
    }
    failed = true;
  }

  if (failed) {
    console.error(
      `${colors.brightRed}${colors.bold}✖ Security status check failed.${colors.reset}`
    );
    console.error(
      `${colors.gray}Vulnerable third-party packages must be fixed or approved (added to ignore list with explicit advisory ID, expiration date <= 90 days, and justification) to pass this gate.${colors.reset}`
    );
    if (options.throwOnError) {
      throw new Error(
        "Security audit failed due to unhandled vulnerabilities or invalid overrides."
      );
    }
    process.exit(1);
  } else {
    console.log(
      `${colors.brightGreen}${colors.bold}✔ Security check passed successfully.${colors.reset}`
    );
    console.log(
      `${colors.gray}No unignored high or critical vulnerabilities found in third-party packages.${colors.reset}`
    );
    if (options.throwOnError) {
      return true;
    }
    process.exit(0);
  }
}

if (
  typeof process.env.VITEST === "undefined" &&
  (require.main === module ||
    (process.argv[1] && process.argv[1].includes("security-audit")))
) {
  runSecurityAudit();
}
