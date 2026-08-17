#!/usr/bin/env node
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { colors } from "../lib/dx/utils";

// List of currently ignored high/critical vulnerabilities to avoid failing on existing/legacy configurations
const DEFAULT_IGNORE_LIST = [
  "concurrently",
  "@lhci/cli",
  "@lhci/utils",
  "@prisma/config",
  "@puppeteer/browsers",
  "brace-expansion",
  "deepmerge-ts",
  "extract-zip",
  "fast-uri",
  "js-yaml",
  "lighthouse",
  "next",
  "postcss",
  "prisma",
  "puppeteer-core",
  "sharp",
  "shell-quote",
  "tmp",
  "hono",
  "ip-address"
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

// Load ignore list from json if available
export function loadIgnoreList(): string[] {
  const rootIgnorePath = path.join(process.cwd(), "security-audit-ignore.json");
  const scriptsIgnorePath = path.join(process.cwd(), "scripts", "security-audit-ignore.json");
  
  if (fs.existsSync(rootIgnorePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(rootIgnorePath, "utf8")) as unknown;
      if (Array.isArray(data)) return data as string[];
    } catch (_e) {
      console.warn("Failed to parse root security-audit-ignore.json, falling back to default.");
    }
  }
  
  if (fs.existsSync(scriptsIgnorePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(scriptsIgnorePath, "utf8")) as unknown;
      if (Array.isArray(data)) return data as string[];
    } catch (_e) {
      console.warn("Failed to parse scripts/security-audit-ignore.json, falling back to default.");
    }
  }
  
  return DEFAULT_IGNORE_LIST;
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

export function runSecurityAudit() {
  console.log(`${colors.bold}${colors.cyan}🛡️  Parallelized Security Workflow Gate${colors.reset}`);
  console.log(`${colors.gray}Executing lockfile vulnerability scans...${colors.reset}\n`);

  const ignoredPackages = loadIgnoreList();
  
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
        // Only count if NOT in the ignore list
        const isIgnored = ignoredPackages.some(ignoredPkg => 
          pkgName.toLowerCase() === ignoredPkg.toLowerCase()
        );
        if (!isIgnored) {
          highOrCriticalVulnerabilities.push({ pkgName, info: vuln });
        }
      }
    }
  }

  let failed = false;

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
    console.error(`${colors.gray}Vulnerable third-party packages must be fixed or approved (added to ignore list) to pass this gate.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.brightGreen}${colors.bold}✔ Security check passed successfully.${colors.reset}`);
    console.log(`${colors.gray}No unignored high or critical vulnerabilities found in third-party packages.${colors.reset}`);
    process.exit(0);
  }
}

if (typeof process.env.VITEST === "undefined") {
  runSecurityAudit();
}
