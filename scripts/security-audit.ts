#!/usr/bin/env node
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { colors } from "../lib/dx/utils";

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

export interface ExemptionEntry {
  package: string;
  rationale: string;
  advisory: string;
  reviewDate?: string;
  approvedBy?: string;
  expiresAt?: string;
  [key: string]: unknown;
}

export interface ManifestValidationResult {
  found: boolean;
  valid: boolean;
  filePath?: string;
  entries: ExemptionEntry[];
  errors: string[];
}

export function loadAndValidateExemptionManifest(workspaceDir?: string): ManifestValidationResult {
  const root = workspaceDir || process.cwd();
  const candidatePaths = [
    path.join(root, "security-audit-exemptions.json"),
    path.join(root, "security-audit-ignore.json"),
    path.join(root, "scripts", "security-audit-exemptions.json"),
    path.join(root, "scripts", "security-audit-ignore.json"),
  ];

  let filePath: string | undefined;
  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      filePath = candidate;
      break;
    }
  }

  if (!filePath) {
    return {
      found: false,
      valid: false,
      entries: [],
      errors: [
        "Security audit exemption manifest file is missing. Expected 'security-audit-exemptions.json' or 'security-audit-ignore.json'."
      ],
    };
  }

  let content: unknown;
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    content = JSON.parse(raw);
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return {
      found: true,
      valid: false,
      filePath,
      entries: [],
      errors: [`Failed to parse JSON in exemption manifest at ${filePath}: ${errorMsg}`],
    };
  }

  let rawEntries: unknown[] = [];

  if (Array.isArray(content)) {
    rawEntries = content;
  } else if (content && typeof content === "object") {
    const obj = content as Record<string, unknown>;
    if (Array.isArray(obj.exemptions)) {
      rawEntries = obj.exemptions;
    } else if (Array.isArray(obj.entries)) {
      rawEntries = obj.entries;
    } else if (Array.isArray(obj.ignoredPackages)) {
      rawEntries = obj.ignoredPackages;
    } else {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        return {
          found: true,
          valid: false,
          filePath,
          entries: [],
          errors: ["Exemption manifest object is empty."],
        };
      }
      for (const key of keys) {
        const val = obj[key];
        if (val && typeof val === "object") {
          rawEntries.push({ package: key, ...(val as object) });
        } else {
          rawEntries.push({ package: key, value: val });
        }
      }
    }
  } else {
    return {
      found: true,
      valid: false,
      filePath,
      entries: [],
      errors: ["Exemption manifest must be a JSON array or object."],
    };
  }

  if (rawEntries.length === 0) {
    return {
      found: true,
      valid: false,
      filePath,
      entries: [],
      errors: ["Exemption manifest contains no entries."],
    };
  }

  const errors: string[] = [];
  const validatedEntries: ExemptionEntry[] = [];

  for (let i = 0; i < rawEntries.length; i++) {
    const item = rawEntries[i];

    if (typeof item === "string") {
      errors.push(
        `Entry ${i + 1} ('${item}'): Missing mandatory justification ('rationale') and advisory metadata ('advisory').`
      );
      continue;
    }

    if (!item || typeof item !== "object") {
      errors.push(`Entry ${i + 1}: Invalid record structure (expected object).`);
      continue;
    }

    const rec = item as Record<string, unknown>;
    const pkgName = (rec.package || rec.name || rec.pkg || rec.dependency) as string | undefined;

    if (!pkgName || typeof pkgName !== "string" || !pkgName.trim()) {
      errors.push(`Entry ${i + 1}: Missing mandatory package name ('package').`);
      continue;
    }

    const rationale = (rec.rationale || rec.justification || rec.reason) as string | undefined;
    const hasRationale = typeof rationale === "string" && rationale.trim().length > 0;
    if (!hasRationale) {
      errors.push(`Entry ${i + 1} (package: '${pkgName.trim()}'): Missing mandatory justification text ('rationale').`);
    }

    const advisory = rec.advisory || rec.advisoryUrl || rec.advisoryRef || rec.advisories || rec.cve;
    const hasAdvisory =
      (typeof advisory === "string" && advisory.trim().length > 0) ||
      (Array.isArray(advisory) && advisory.length > 0);
    if (!hasAdvisory) {
      errors.push(`Entry ${i + 1} (package: '${pkgName.trim()}'): Missing mandatory security advisory reference ('advisory').`);
    }

    if (pkgName && hasRationale && hasAdvisory) {
      validatedEntries.push({
        package: pkgName.trim(),
        rationale: rationale!.trim(),
        advisory: typeof advisory === "string" ? advisory.trim() : JSON.stringify(advisory),
        reviewDate: typeof rec.reviewDate === "string" ? rec.reviewDate : undefined,
        approvedBy: typeof rec.approvedBy === "string" ? rec.approvedBy : undefined,
        expiresAt: typeof rec.expiresAt === "string" ? rec.expiresAt : undefined,
      });
    }
  }

  const isValid = errors.length === 0;

  return {
    found: true,
    valid: isValid,
    filePath,
    entries: validatedEntries,
    errors,
  };
}

export function loadIgnoreList(workspaceDir?: string): string[] {
  const result = loadAndValidateExemptionManifest(workspaceDir);
  if (result.found && result.valid) {
    return result.entries.map((e) => e.package);
  }
  return [];
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

  const manifestResult = loadAndValidateExemptionManifest();

  if (!manifestResult.found) {
    console.error(`${colors.brightRed}${colors.bold}❌ SECURITY AUDIT FAILED CLOSED:${colors.reset}`);
    console.error(`${colors.red}Exemption manifest file is missing. Expected 'security-audit-exemptions.json' or 'security-audit-ignore.json'. Hardcoded fallback lists have been removed.${colors.reset}\n`);
    process.exit(1);
  }

  if (!manifestResult.valid) {
    console.error(`${colors.brightRed}${colors.bold}❌ SECURITY AUDIT FAILED:${colors.reset}`);
    console.error(`${colors.red}Invalid exemption manifest schema in ${manifestResult.filePath}:${colors.reset}`);
    for (const err of manifestResult.errors) {
      console.error(`  ${colors.bold}${colors.brightYellow}• Error:${colors.reset} ${err}`);
    }
    console.error("");
    process.exit(1);
  }

  const ignoredPackages = manifestResult.entries.map((e) => e.package.toLowerCase());

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
        // Only count if NOT in the exemption list
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
    console.error(`${colors.gray}Vulnerable third-party packages must be fixed or documented with required justification in security-audit-exemptions.json to pass this gate.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.brightGreen}${colors.bold}✔ Security check passed successfully.${colors.reset}`);
    console.log(`${colors.gray}No unexempted high or critical vulnerabilities found in third-party packages (${manifestResult.entries.length} documented package exemption(s)).${colors.reset}`);
    process.exit(0);
  }
}

if (typeof process.env.VITEST === "undefined") {
  runSecurityAudit();
}
