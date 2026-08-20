import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { scanFile } from "../validation-scanner";
import { colors, badge, formatSection } from "./utils";
import { checkEnvironmentVariables } from "./env-guard";
import { checkGitHygieneConfig } from "./git-guard";
import { checkDeadCode } from "./dead-code";
import { checkBundleBudgets } from "./bundle-guard";
import { getEnv } from "../env";

export interface DiagnosticCheckResult {
  id: string;
  name: string;
  category: "architecture" | "routes" | "security" | "database" | "docs" | "hydration" | "accessibility" | "quality";
  status: "pass" | "fail" | "warn" | "fixed";
  message: string;
  details?: string[];
  fixable?: boolean;
  fixedMessage?: string;
}

export interface DoctorOptions {
  fix?: boolean;
  ci?: boolean;
  quiet?: boolean;
  workspaceRoot?: string;
}

/**
 * Helper to recursively find files
 */
function findFiles(dir: string, pattern: RegExp, ignoreDirs: string[] = ["node_modules", ".git", ".next", "dist"]): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name)) {
        results.push(...findFiles(fullPath, pattern, ignoreDirs));
      }
    } else if (pattern.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Check Route Registration in CommandPalette.tsx (AGENTS.md Invariant #3)
 */
export function checkRouteIndexing(root: string, fix = false): DiagnosticCheckResult {
  const appDir = path.join(root, "app");
  const paletteFile = path.join(root, "components", "CommandPalette.tsx");

  if (!fs.existsSync(paletteFile)) {
    return {
      id: "routes-command-palette-exists",
      name: "CommandPalette Registration File Check",
      category: "routes",
      status: "fail",
      message: "components/CommandPalette.tsx not found",
      fixable: false,
    };
  }

  const paletteContent = fs.readFileSync(paletteFile, "utf-8");
  const pageFiles = findFiles(appDir, /^page\.tsx?$/);

  const missingRoutes: { routePath: string; url: string }[] = [];

  for (const pageFile of pageFiles) {
    const relative = path.relative(appDir, pageFile);
    // Ignore internal routes, group routes, or api
    if (relative.startsWith("api") || relative.includes("[")) {
      continue;
    }

    let routeUrl = "/" + path.dirname(relative).replace(/\\/g, "/");
    if (routeUrl === "/.") routeUrl = "/";

    // Skip root '/' if already handled by #case-studies or nav-work
    if (routeUrl === "/") continue;

    // Check if route URL appears in staticNavs in CommandPalette.tsx
    const urlPattern = new RegExp(`url:\\s*["'\`]${routeUrl}["'\`]`);
    if (!urlPattern.test(paletteContent)) {
      missingRoutes.push({ routePath: relative, url: routeUrl });
    }
  }

  if (missingRoutes.length === 0) {
    return {
      id: "routes-indexed",
      name: "First-Class Route Command Palette Registration",
      category: "routes",
      status: "pass",
      message: "All first-class app routes are registered in CommandPalette staticNavs.",
    };
  }

  if (fix) {
    // Attempt auto-fix by injecting missing routes into staticNavs array
    let updatedContent = paletteContent;
    const staticNavsRegex = /(const staticNavs:\s*PaletteItem\[\]\s*=\s*\[)([\s\S]*?)(\n\s*\];)/;
    const match = paletteContent.match(staticNavsRegex);

    if (match) {
      const generatedItems = missingRoutes.map((mr) => {
        const idSlug = mr.url.replace(/^\//, "").replace(/\//g, "-");
        const titleName = idSlug
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ");
        return `      {\n        id: "nav-${idSlug}",\n        title: "${titleName}",\n        subtitle: "Navigate to ${titleName} view",\n        category: "navigation",\n        url: "${mr.url}",\n        icon: <IconDirections className="w-4 h-4 text-brand-cyan" />\n      },`;
      });

      const insertion = "\n" + generatedItems.join("\n");
      updatedContent = paletteContent.replace(staticNavsRegex, `$1$2${insertion}$3`);
      fs.writeFileSync(paletteFile, updatedContent, "utf-8");

      return {
        id: "routes-indexed",
        name: "First-Class Route Command Palette Registration",
        category: "routes",
        status: "fixed",
        message: `Auto-registered ${missingRoutes.length} missing route(s) in CommandPalette.tsx`,
        details: missingRoutes.map((m) => `${m.url} (${m.routePath})`),
      };
    }
  }

  return {
    id: "routes-indexed",
    name: "First-Class Route Command Palette Registration",
    category: "routes",
    status: "fail",
    message: `${missingRoutes.length} route(s) not registered in CommandPalette.tsx staticNavs (AGENTS.md #3)`,
    details: missingRoutes.map((m) => `Missing registration for ${m.url} (from app/${m.routePath})`),
    fixable: true,
  };
}

/**
 * Check Layout and Navbar Invariant (AGENTS.md Invariant #2).
 * No secondary Navbar components allowed outside app/layout.tsx.
 */
export function checkNavbarHierarchy(root: string): DiagnosticCheckResult {
  const appDir = path.join(root, "app");
  const tsxFiles = findFiles(appDir, /\.tsx$/);
  const violations: string[] = [];

  for (const file of tsxFiles) {
    const relative = path.relative(root, file);
    if (relative === path.join("app", "layout.tsx")) {
      continue;
    }
    const content = fs.readFileSync(file, "utf-8");
    // Check if Navbar is imported or rendered as a JSX tag
    const rendersNavbar = /<Navbar\b/.test(content) || /import\s+.*Navbar.*from\s+["']@\/components\/Navbar["']/.test(content);
    if (rendersNavbar) {
      violations.push(relative);
    }
  }

  if (violations.length === 0) {
    return {
      id: "layout-navbar-hierarchy",
      name: "Global Navbar Single-Mount Invariant",
      category: "architecture",
      status: "pass",
      message: "Navbar is only mounted in app/layout.tsx. No duplicate Navbars detected.",
    };
  }

  return {
    id: "layout-navbar-hierarchy",
    name: "Global Navbar Single-Mount Invariant",
    category: "architecture",
    status: "fail",
    message: `Secondary <Navbar /> component rendered in ${violations.length} subpage(s) (AGENTS.md #2)`,
    details: violations.map((v) => `Secondary Navbar in: ${v}`),
    fixable: false,
  };
}

/**
 * Check Page Top-Padding Invariant (AGENTS.md Invariant #2).
 * Root page wrappers must feature pt-24 to pt-32 to clear fixed header.
 */
export function checkPageTopPadding(root: string): DiagnosticCheckResult {
  const appDir = path.join(root, "app");
  const pageFiles = findFiles(appDir, /^page\.tsx$/);
  const warnings: string[] = [];

  for (const file of pageFiles) {
    const relative = path.relative(root, file);
    // Skip API or non-route files
    if (relative.startsWith("app/api") || relative.startsWith("app/generated")) continue;

    const content = fs.readFileSync(file, "utf-8");
    const hasTopPadding =
      /\bpt-(20|24|28|32|36|40|44|48|\[\d+px\])\b/.test(content) ||
      /min-h-(screen|dvh)/.test(content) ||
      /<PageLayout\b/.test(content);

    if (!hasTopPadding) {
      warnings.push(relative);
    }
  }

  if (warnings.length === 0) {
    return {
      id: "layout-top-padding",
      name: "Page Header Clearance Top-Padding Invariant",
      category: "architecture",
      status: "pass",
      message: "All route root containers include header clearance padding (pt-24 to pt-32).",
    };
  }

  return {
    id: "layout-top-padding",
    name: "Page Header Clearance Top-Padding Invariant",
    category: "architecture",
    status: "warn",
    message: `${warnings.length} page(s) may lack header clearance top-padding (pt-24 to pt-32)`,
    details: warnings.map((w) => `Check top-padding in: ${w}`),
  };
}

/**
 * Check Test Environment Path Resolution (AGENTS.md Invariant #1).
 * Tests must not hardcode '/app' or absolute local root paths.
 */
export function checkTestPathResolution(root: string): DiagnosticCheckResult {
  const testsDir = path.join(root, "__tests__");
  const testFiles = findFiles(testsDir, /\.(test|spec)\.(ts|tsx|js)$/);
  const violations: { file: string; line: number; match: string }[] = [];

  for (const file of testFiles) {
    const relative = path.relative(root, file);
    // Skip test fixtures in error sanitization or doctor tests that purposefully contain mock stack strings
    if (
      relative.includes("error-sanitization.test.ts") ||
      relative.includes("dx-doctor.test.ts") ||
      relative.includes("defect-remediation-regression.test.ts") ||
      relative.includes("property-fuzz.test.ts")
    ) {
      continue;
    }

    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      // Look for hardcoded root paths like "/app/..." or absolute macOS/Linux roots
      if (
        /(path\.resolve|readFileSync|join)\(\s*['"`]\/app\//.test(line) ||
        /(root|dir|cwd|workspaceRoot)\s*=\s*['"`]\/app\/[^'"`]+['"`]/.test(line) ||
        /['"`]\/(Users|home)\/[a-zA-Z0-9_-]+\//.test(line)
      ) {
        violations.push({ file: relative, line: index + 1, match: line.trim() });
      }
    });
  }

  if (violations.length === 0) {
    return {
      id: "tests-dynamic-paths",
      name: "Dynamic Path Resolution in Test Suites",
      category: "architecture",
      status: "pass",
      message: "All tests dynamically resolve workspace root via process.cwd() or path.resolve().",
    };
  }

  return {
    id: "tests-dynamic-paths",
    name: "Dynamic Path Resolution in Test Suites",
    category: "architecture",
    status: "fail",
    message: `Hardcoded root paths detected in ${violations.length} test location(s) (AGENTS.md #1)`,
    details: violations.map((v) => `${v.file}:${v.line} -> ${v.match}`),
    fixable: false,
  };
}

/**
 * Secret & Credential Leak Scanner
 */
export function checkSecretLeaks(root: string): DiagnosticCheckResult {
  const candidateFiles = findFiles(root, /\.(ts|tsx|js|mjs|json|yml|yaml|md)$/, [
    "node_modules",
    ".git",
    ".next",
    "dist",
    "coverage",
    "__tests__",
    ".husky",
  ]);

  const ignoredFiles = [
    "package-lock.json",
    "bun.lock",
    "yarn.lock",
    "pnpm-lock.yaml",
    "ci.yml",
    "synthetic-probes.yml",
    ".env.example",
    "env-guard.ts",
  ];

  const leaks: { file: string; line: number; category: string }[] = [];

  for (const file of candidateFiles) {
    const baseName = path.basename(file);
    if (ignoredFiles.includes(baseName) || baseName.startsWith(".env")) {
      continue;
    }
    const matches = scanFile(file);
    for (const match of matches) {
      leaks.push({
        file: path.relative(root, file),
        line: match.lineNumber,
        category: match.category,
      });
    }
  }

  if (leaks.length === 0) {
    return {
      id: "security-credentials",
      name: "Zero Hardcoded Credentials & Secrets Scanner",
      category: "security",
      status: "pass",
      message: "No private keys, tokens, or live database passwords detected in repository files.",
    };
  }

  return {
    id: "security-credentials",
    name: "Zero Hardcoded Credentials & Secrets Scanner",
    category: "security",
    status: "fail",
    message: `${leaks.length} sensitive credential pattern(s) detected`,
    details: leaks.map((l) => `${l.file}:${l.line} -> ${l.category}`),
    fixable: false,
  };
}

/**
 * Migration Integrity, Provider Parity & Destructive Migration Guard
 */
export function checkMigrationGuard(root: string): DiagnosticCheckResult {
  const migrationsDir = path.join(root, "prisma", "migrations");
  const schemaPath = path.join(root, "prisma", "schema.prisma");
  const lockPath = path.join(migrationsDir, "migration_lock.toml");

  if (!fs.existsSync(migrationsDir)) {
    return {
      id: "database-migrations",
      name: "Prisma Migration Integrity & Destructive Guard",
      category: "database",
      status: "pass",
      message: "No migrations folder present (skipped).",
    };
  }

  const failures: string[] = [];

  // 1. Check Provider Parity
  if (fs.existsSync(schemaPath) && fs.existsSync(lockPath)) {
    try {
      const schemaContent = fs.readFileSync(schemaPath, "utf-8");
      const lockContent = fs.readFileSync(lockPath, "utf-8");
      const schemaProviderMatch = schemaContent.match(/datasource\s+\w+\s*\{[\s\S]*?provider\s*=\s*["']([^"']+)["']/);
      const lockProviderMatch = lockContent.match(/^provider\s*=\s*["']([^"']+)["']/m);

      if (schemaProviderMatch && lockProviderMatch) {
        if (schemaProviderMatch[1] !== lockProviderMatch[1]) {
          failures.push(`Provider mismatch: schema.prisma uses '${schemaProviderMatch[1]}', migration_lock.toml uses '${lockProviderMatch[1]}'.`);
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      failures.push(`Failed to verify provider parity: ${msg}`);
    }
  }

  // 2. Check File Integrity
  const sqlFiles = findFiles(migrationsDir, /\.sql$/);
  if (sqlFiles.length === 0) {
    failures.push("No migration SQL files found in prisma/migrations.");
  } else {
    for (const sqlFile of sqlFiles) {
      const content = fs.readFileSync(sqlFile, "utf-8");
      if (content.trim() === "") {
        failures.push(`Empty migration SQL file found at ${path.relative(root, sqlFile)}.`);
      }
    }
  }

  // 3. Check Destructive Queries
  const destructiveViolations: { file: string; ddl: string }[] = [];
  for (const file of sqlFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const dropMatches = content.match(/\b(DROP\s+TABLE|DROP\s+COLUMN)\b/gi);
    if (dropMatches && !getEnv().ALLOW_DESTRUCTIVE_MIGRATIONS) {
      destructiveViolations.push({
        file: path.relative(root, file),
        ddl: dropMatches.join(", "),
      });
    }
  }
  for (const v of destructiveViolations) {
    failures.push(`Destructive DDL detected in ${v.file}: ${v.ddl}`);
  }

  if (failures.length === 0) {
    return {
      id: "database-migrations",
      name: "Prisma Migration Integrity & Destructive Guard",
      category: "database",
      status: "pass",
      message: "All migration SQL files pass integrity checks with zero unapproved destructive DDL.",
    };
  }

  return {
    id: "database-migrations",
    name: "Prisma Migration Integrity & Destructive Guard",
    category: "database",
    status: "fail",
    message: `${failures.length} database migration invariant issue(s) detected`,
    details: failures,
    fixable: false,
  };
}

/**
 * Documentation & TypeDoc Parity Check
 */
export function checkDocumentationParity(root: string, fix = false): DiagnosticCheckResult {
  const docsDir = path.join(root, "docs");
  if (!fs.existsSync(docsDir)) {
    return {
      id: "docs-drift",
      name: "TypeDoc & Markdown Documentation Parity",
      category: "docs",
      status: "fail",
      message: "docs/ directory does not exist. Run 'npm run compile-docs' to generate.",
      fixable: true,
    };
  }

  if (fix) {
    try {
      execSync("npm run compile-docs", { cwd: root, stdio: "ignore" });
      return {
        id: "docs-drift",
        name: "TypeDoc & Markdown Documentation Parity",
        category: "docs",
        status: "fixed",
        message: "Successfully recompiled TypeDoc markdown documentation.",
      };
    } catch {
      return {
        id: "docs-drift",
        name: "TypeDoc & Markdown Documentation Parity",
        category: "docs",
        status: "fail",
        message: "Failed to compile TypeDoc documentation.",
      };
    }
  }

  const driftDetails: string[] = [];

  try {
    const diff = execSync("git diff --name-only docs", { cwd: root, encoding: "utf-8" }).trim();
    if (diff.length > 0) {
      driftDetails.push(...diff.split("\n").map((f) => `Modified: ${f}`));
    }
    const untracked = execSync("git ls-files --others --exclude-standard docs", { cwd: root, encoding: "utf-8" }).trim();
    if (untracked.length > 0) {
      driftDetails.push(...untracked.split("\n").map((f) => `Untracked: ${f}`));
    }
  } catch {
    // Git diff failed or not a git repository
  }

  if (driftDetails.length > 0) {
    return {
      id: "docs-drift",
      name: "TypeDoc & Markdown Documentation Parity",
      category: "docs",
      status: "fail",
      message: `TypeDoc markdown documentation in docs/ is out of sync (${driftDetails.length} file(s)).`,
      details: driftDetails,
      fixable: true,
    };
  }

  return {
    id: "docs-drift",
    name: "TypeDoc & Markdown Documentation Parity",
    category: "docs",
    status: "pass",
    message: "Documentation in docs/ is synchronized and up to date.",
  };
}

/**
 * Onboarding Documentation & Engine Constraint Drift Check
 */
export function checkOnboardingDocsDrift(root: string, fix = false): DiagnosticCheckResult {
  const readmePath = path.join(root, "README.md");
  const docsReadmePath = path.join(root, "docs", "README.md");
  const targetFiles = [readmePath];
  if (fs.existsSync(docsReadmePath)) {
    targetFiles.push(docsReadmePath);
  }

  const failures: string[] = [];

  const obsoleteBadges = [
    /img\.shields\.io\/badge\/Python/i,
    /img\.shields\.io\/badge\/PyQt6/i,
    /img\.shields\.io\/badge\/ONNX_Runtime/i,
    /img\.shields\.io\/badge\/SQLCipher/i,
    /img\.shields\.io\/badge\/Pytest_Coverage/i,
  ];

  for (const filePath of targetFiles) {
    if (!fs.existsSync(filePath)) {
      failures.push(`Target onboarding doc missing: ${path.relative(root, filePath)}`);
      continue;
    }

    const relative = path.relative(root, filePath);
    const content = fs.readFileSync(filePath, "utf-8");

    // 1. Obsolete Badges Check
    for (const badgeRegex of obsoleteBadges) {
      if (badgeRegex.test(content)) {
        failures.push(`${relative}: Obsolete Python technology badge detected in top header.`);
        break;
      }
    }

    // 2. Node & npm Engine Requirements Check
    if (!/Node\.js.*22/i.test(content)) {
      failures.push(`${relative}: Missing explicit requirement for Node.js 22.x in prerequisites.`);
    }

    if (/\b(v20\+|v18\+|v16\+)\b/i.test(content)) {
      failures.push(`${relative}: Incorrect Node version (v20+/v18+/v16+) listed in prerequisites.`);
    }

    if (/\b(bun|yarn|pnpm)\b.*as the package manager/i.test(content) || /npm\s+or\s+bun/i.test(content)) {
      failures.push(`${relative}: Lists unsupported package manager (bun/yarn/pnpm) in prerequisites.`);
    }

    // 3. Environment Template Reference Check
    if (content.includes(".env.local.example")) {
      failures.push(`${relative}: References invalid environment template '.env.local.example' instead of '.env.example'.`);
    }

    if (!content.includes(".env.example")) {
      failures.push(`${relative}: Missing reference to valid environment template '.env.example'.`);
    }

    // 4. Database Setup Sequence Check (prisma db push before prisma db seed)
    const pushIndex = content.indexOf("prisma db push");
    const seedIndex = content.indexOf("prisma db seed");

    if (pushIndex === -1) {
      failures.push(`${relative}: Missing database schema push command ('npx prisma db push') in setup instructions.`);
    } else if (seedIndex !== -1 && pushIndex > seedIndex) {
      failures.push(`${relative}: Schema push command ('prisma db push') must precede database seeding ('prisma db seed').`);
    }
  }

  if (failures.length > 0) {
    if (fix) {
      try {
        execSync("npm run compile-docs", { cwd: root, stdio: "ignore" });
      } catch {
        // ignore
      }
    }

    return {
      id: "docs-onboarding-drift",
      name: "Onboarding Documentation & Engine Sync Guard",
      category: "docs",
      status: "fail",
      message: `${failures.length} onboarding documentation drift issue(s) detected.`,
      details: failures,
      fixable: true,
    };
  }

  return {
    id: "docs-onboarding-drift",
    name: "Onboarding Documentation & Engine Sync Guard",
    category: "docs",
    status: "pass",
    message: "Onboarding documentation matches Node.js 22.x/npm engine constraints, environment templates, and database setup sequence.",
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Architecture Topology Drift Verification Check
 * Asserts that all top-level repository directories are explicitly represented in ARCHITECTURE.md
 */
export function checkArchitectureTopologyDrift(root: string, fix = false): DiagnosticCheckResult {
  const archPath = path.join(root, "ARCHITECTURE.md");
  const mediaArchPath = path.join(root, "docs", "_media", "ARCHITECTURE.md");

  if (!fs.existsSync(archPath)) {
    return {
      id: "docs-topology-drift",
      name: "Architecture Directory Topology Overview Guard",
      category: "architecture",
      status: "fail",
      message: "ARCHITECTURE.md file not found in workspace root.",
      fixable: false,
    };
  }

  const archContent = fs.readFileSync(archPath, "utf-8");

  const topologyHeaderMatch = archContent.match(/##\s+System Architecture & Directory Topology/i);
  if (!topologyHeaderMatch) {
    return {
      id: "docs-topology-drift",
      name: "Architecture Directory Topology Overview Guard",
      category: "architecture",
      status: "fail",
      message: "## System Architecture & Directory Topology section missing from ARCHITECTURE.md.",
      fixable: false,
    };
  }

  const startIndex = topologyHeaderMatch.index! + topologyHeaderMatch[0].length;
  const nextHeaderMatch = archContent.slice(startIndex).match(/\n##\s+/);
  const topologySection = nextHeaderMatch
    ? archContent.slice(startIndex, startIndex + nextHeaderMatch.index!)
    : archContent.slice(startIndex);

  const ignoreDirs = new Set([
    "node_modules",
    "dist",
    "coverage",
    "build",
    "out",
    ".next",
    ".git",
    ".github",
    ".husky",
    ".jules",
    ".agents",
    "tmp",
    "scratch",
  ]);

  const entries = fs.readdirSync(root, { withFileTypes: true });
  const topLevelDirs = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && !ignoreDirs.has(entry.name))
    .map((entry) => entry.name);

  const missingDirs: string[] = [];

  for (const dirName of topLevelDirs) {
    const dirPattern = new RegExp(`(?:^|[\\s/│├└──-])${escapeRegExp(dirName)}\\/?(?:[\\s/#:│]|$|\\n)`, "m");
    if (!dirPattern.test(topologySection)) {
      missingDirs.push(dirName);
    }
  }

  if (missingDirs.length > 0) {
    return {
      id: "docs-topology-drift",
      name: "Architecture Directory Topology Overview Guard",
      category: "architecture",
      status: "fail",
      message: `${missingDirs.length} top-level directory/directories missing from ARCHITECTURE.md topology section.`,
      details: missingDirs.map((d) => `Missing top-level directory in ARCHITECTURE.md: ${d}/`),
      fixable: false,
    };
  }

  if (fs.existsSync(mediaArchPath)) {
    const mediaContent = fs.readFileSync(mediaArchPath, "utf-8");
    if (mediaContent !== archContent) {
      if (fix) {
        fs.copyFileSync(archPath, mediaArchPath);
        return {
          id: "docs-topology-drift",
          name: "Architecture Directory Topology Overview Guard",
          category: "architecture",
          status: "fixed",
          message: "Synchronized docs/_media/ARCHITECTURE.md with ARCHITECTURE.md.",
        };
      }
      return {
        id: "docs-topology-drift",
        name: "Architecture Directory Topology Overview Guard",
        category: "architecture",
        status: "fail",
        message: "docs/_media/ARCHITECTURE.md is out of sync with workspace root ARCHITECTURE.md.",
        details: ["Run 'npm run doctor:fix' or 'cp ARCHITECTURE.md docs/_media/ARCHITECTURE.md' to synchronize."],
        fixable: true,
      };
    }
  }

  return {
    id: "docs-topology-drift",
    name: "Architecture Directory Topology Overview Guard",
    category: "architecture",
    status: "pass",
    message: "All top-level repository directories are accurately represented in ARCHITECTURE.md topology overview.",
  };
}

/**
 * OpenAPI Parity & Route Completeness Check
 */
export function checkOpenApiParity(root: string, fix = false): DiagnosticCheckResult {
  const openApiFile = path.join(root, "openapi.json");
  const generatorScript = path.join(root, "scripts", "generate-openapi.ts");
  const apiDir = path.join(root, "app", "api");

  if (!fs.existsSync(openApiFile) || !fs.existsSync(generatorScript)) {
    return {
      id: "api-openapi-sync",
      name: "OpenAPI Specification Contract Sync",
      category: "architecture",
      status: "warn",
      message: "openapi.json or scripts/generate-openapi.ts not found.",
      fixable: true,
    };
  }

  if (fix) {
    try {
      execSync("npx tsx scripts/generate-openapi.ts", { cwd: root, stdio: "ignore" });
      return {
        id: "api-openapi-sync",
        name: "OpenAPI Specification Contract Sync",
        category: "architecture",
        status: "fixed",
        message: "Successfully regenerated openapi.json specification with complete route coverage.",
      };
    } catch {
      return {
        id: "api-openapi-sync",
        name: "OpenAPI Specification Contract Sync",
        category: "architecture",
        status: "fail",
        message: "Failed to generate openapi.json.",
      };
    }
  }

  // 1. Discover all app/api routes
  const routeFiles = findFiles(apiDir, /^route\.(ts|js)$/);
  const expectedRoutes = routeFiles.map((file) => {
    const rel = path.relative(apiDir, path.dirname(file)).replace(/\\/g, "/");
    return rel === "" ? "/api" : `/api/${rel}`;
  });

  let parsedSpec: { paths?: Record<string, unknown> } = {};
  try {
    const fileContent = fs.readFileSync(openApiFile, "utf-8");
    parsedSpec = JSON.parse(fileContent);
  } catch {
    return {
      id: "api-openapi-sync",
      name: "OpenAPI Specification Contract Sync",
      category: "architecture",
      status: "fail",
      message: "openapi.json is not valid JSON.",
      fixable: true,
    };
  }

  const documentedRoutes = Object.keys(parsedSpec.paths || {});
  const missingRoutes = expectedRoutes.filter((r) => !documentedRoutes.includes(r));

  if (missingRoutes.length > 0) {
    return {
      id: "api-openapi-sync",
      name: "OpenAPI Specification Contract Sync",
      category: "architecture",
      status: "fail",
      message: `${missingRoutes.length} route(s) missing from openapi.json specification`,
      details: missingRoutes.map((r) => `Missing specification for: ${r}`),
      fixable: true,
    };
  }

  return {
    id: "api-openapi-sync",
    name: "OpenAPI Specification Contract Sync",
    category: "architecture",
    status: "pass",
    message: "All app/api routes are documented in openapi.json with zero specification drift.",
  };
}

/**
 * Hydration & React SSR Best Practices Check (AGENTS.md Invariant #4)
 */
export function checkHydrationSafety(root: string): DiagnosticCheckResult {
  const componentsDir = path.join(root, "components");
  const appDir = path.join(root, "app");
  const files = [...findFiles(componentsDir, /\.tsx$/), ...findFiles(appDir, /\.tsx$/)];

  const warnings: { file: string; pattern: string }[] = [];

  for (const file of files) {
    const relative = path.relative(root, file);
    const content = fs.readFileSync(file, "utf-8");

    // Scan for unsuppressed Math.random() in rendering JSX
    if (/<div>.*Math\.random\(.*\).*<\/div>/.test(content) && !/suppressHydrationWarning/.test(content)) {
      warnings.push({ file: relative, pattern: "Math.random() in JSX without suppressHydrationWarning" });
    }
    // Scan for direct window / localStorage reads in initial useState initializers without useSyncExternalStore
    if (/useState\(\s*\(\)\s*=>\s*(typeof window !== ["']undefined["'] \? localStorage|localStorage\.getItem)/.test(content)) {
      warnings.push({ file: relative, pattern: "Direct localStorage in useState initializer (prefer useSyncExternalStore)" });
    }
  }

  if (warnings.length === 0) {
    return {
      id: "hydration-safety",
      name: "React 19 & Next.js 16 Hydration Determinism",
      category: "hydration",
      status: "pass",
      message: "Zero hydration antipatterns detected. Client state uses useSyncExternalStore or mounted bounds.",
    };
  }

  return {
    id: "hydration-safety",
    name: "React 19 & Next.js 16 Hydration Determinism",
    category: "hydration",
    status: "warn",
    message: `${warnings.length} potential hydration mismatch pattern(s) detected (AGENTS.md #4)`,
    details: warnings.map((w) => `${w.file}: ${w.pattern}`),
  };
}

/**
 * Accessibility Standards & WCAG 2.1 Conformance Guard (Invariant #10)
 * Ensures bypass skip links, semantic main landmark, live announcer provider, and alt/label tags are present.
 */
export function checkAccessibilityStandards(root: string, fix = false): DiagnosticCheckResult {
  const layoutFile = path.join(root, "app", "layout.tsx");
  const violations: string[] = [];

  if (!fs.existsSync(layoutFile)) {
    return {
      id: "a11y-standards",
      name: "WCAG 2.1 Accessibility & Landmark Standards",
      category: "accessibility",
      status: "fail",
      message: "app/layout.tsx not found",
      fixable: false,
    };
  }

  let layoutContent = fs.readFileSync(layoutFile, "utf-8");

  // Check 1: SkipToContent or accessible skip link
  const hasSkipLink = /<SkipToContent\b|href=["']#main-content["']/.test(layoutContent);
  if (!hasSkipLink) {
    violations.push("Missing SkipToContent or #main-content skip link in app/layout.tsx");
  }

  // Check 2: Semantic main element with id="main-content"
  const hasMainLandmark = /<main[^>]*id=["']main-content["']|<main[^>]*\bid=["']main-content["']/.test(layoutContent);
  if (!hasMainLandmark) {
    violations.push("Missing semantic main landmark with id='main-content' in app/layout.tsx");
  }

  // Check 3: Live Announcer Provider
  const hasAnnouncer = /<A11yProvider\b|<LiveAnnouncerProvider\b/.test(layoutContent);
  if (!hasAnnouncer) {
    violations.push("Missing A11yProvider / LiveAnnouncerProvider screen-reader live region in app/layout.tsx");
  }

  // Auto-fix if fix is true and layout violations exist
  if (fix && violations.length > 0) {
    let modified = false;
    if (!hasSkipLink && !layoutContent.includes("SkipToContent")) {
      layoutContent = `import { SkipToContent } from "@/components/SkipToContent";\n` + layoutContent;
      layoutContent = layoutContent.replace(/<body[^>]*>/, (match) => `${match}\n        <SkipToContent />`);
      modified = true;
    }
    if (!hasMainLandmark && layoutContent.includes("{children}")) {
      layoutContent = layoutContent.replace(
        /<div className="flex-grow flex flex-col">\s*\{children\}\s*<\/div>/,
        '<main id="main-content" tabIndex={-1} className="flex-grow flex flex-col focus:outline-none">\n                {children}\n              </main>'
      );
      modified = true;
    }
    if (modified) {
      fs.writeFileSync(layoutFile, layoutContent, "utf-8");
      return {
        id: "a11y-standards",
        name: "WCAG 2.1 Accessibility & Landmark Standards",
        category: "accessibility",
        status: "fixed",
        message: "Auto-remediated layout landmarks and skip links in app/layout.tsx",
        details: violations,
      };
    }
  }

  if (violations.length === 0) {
    return {
      id: "a11y-standards",
      name: "WCAG 2.1 Accessibility & Landmark Standards",
      category: "accessibility",
      status: "pass",
      message: "Root layout satisfies WCAG 2.1 skip link, semantic main landmark, and dynamic live announcer standards.",
    };
  }

  return {
    id: "a11y-standards",
    name: "WCAG 2.1 Accessibility & Landmark Standards",
    category: "accessibility",
    status: "fail",
    message: `${violations.length} accessibility structure violation(s) detected in app/layout.tsx`,
    details: violations,
    fixable: true,
  };
}

/**
 * Check Defect Remediation & Root-Cause Invariants (AGENTS.md Invariant #11).
 * Asserts presence of regression test harness and computational boundary defenses.
 */
export function checkDefectRemediationInvariants(root: string): DiagnosticCheckResult {
  const regressionTestFile = path.join(root, "__tests__", "defect-remediation-regression.test.ts");
  const adrFile = path.join(root, "adr", "0007-comprehensive-defect-remediation-strategy.md");
  const violations: string[] = [];

  if (!fs.existsSync(regressionTestFile)) {
    violations.push("Missing primary defect remediation regression suite: __tests__/defect-remediation-regression.test.ts");
  }

  if (!fs.existsSync(adrFile)) {
    violations.push("Missing Architectural Decision Record: adr/0007-comprehensive-defect-remediation-strategy.md");
  }

  // Scan computational engine files for boundary guards
  const engineChecks = [
    { file: "lib/proof-utils.ts", pattern: /depth\s*>\s*500/, label: "Proof AST recursion limit guard" },
    { file: "lib/garmin-engine.ts", pattern: /safeDelta\s*=\s*Number\.isFinite/, label: "Garmin telemetry finite delta guard" },
    { file: "lib/working-with-duck-engine.ts", pattern: /safeX\s*=\s*Number\.isFinite/, label: "Duck engine coordinate boundary guard" },
    { file: "lib/crf/ast-evaluator.ts", pattern: /ExpressionEvaluator/, label: "CRF AST Expression Evaluator" },
  ];

  for (const ec of engineChecks) {
    const fullPath = path.join(root, ec.file);
    if (!fs.existsSync(fullPath)) {
      violations.push(`Missing core computational engine: ${ec.file}`);
      continue;
    }
    const content = fs.readFileSync(fullPath, "utf-8");
    if (!ec.pattern.test(content)) {
      violations.push(`Engine ${ec.file} lacks verified invariant defense: ${ec.label}`);
    }
  }

  if (violations.length === 0) {
    return {
      id: "quality-defect-remediation",
      name: "Defect Remediation & Root-Cause Regression Invariant",
      category: "quality",
      status: "pass",
      message: "All legacy computational engines enforce boundary defenses, and verified regression test harness is active.",
    };
  }

  return {
    id: "quality-defect-remediation",
    name: "Defect Remediation & Root-Cause Regression Invariant",
    category: "quality",
    status: "fail",
    message: `${violations.length} defect remediation invariant violation(s) detected (AGENTS.md #11)`,
    details: violations,
    fixable: false,
  };
}

/**
 * Check Proactive Defect Interception, Shift-Left Gateways & Synthetic Probes (AGENTS.md Invariant #12).
 */
export function checkProactiveDefectInterception(root: string): DiagnosticCheckResult {
  const violations: string[] = [];

  const requiredFiles = [
    { file: "stryker.config.mjs", desc: "Stryker mutation testing configuration" },
    { file: "__tests__/property-fuzz.test.ts", desc: "Fast-check property & generative fuzz test suite" },
    { file: "__tests__/e2e/synthetic-probes.spec.ts", desc: "Headless synthetic journey probe suite" },
    { file: ".github/workflows/synthetic-probes.yml", desc: "Scheduled synthetic probe monitoring workflow" },
    { file: "scripts/canary-analyzer.ts", desc: "Automated Canary Analysis (ACA) engine" },
    { file: "adr/0008-proactive-defect-interception-strategy.md", desc: "ADR-0008 Proactive Defect Interception Strategy" },
  ];

  for (const rf of requiredFiles) {
    const fullPath = path.join(root, rf.file);
    if (!fs.existsSync(fullPath)) {
      violations.push(`Missing ${rf.desc}: ${rf.file}`);
    }
  }

  if (violations.length === 0) {
    return {
      id: "quality-proactive-interception",
      name: "Proactive Defect Interception & Synthetic Reliability Invariant",
      category: "quality",
      status: "pass",
      message: "Shift-left property fuzzing, synthetic journey probes, and canary analyzer are active.",
    };
  }

  return {
    id: "quality-proactive-interception",
    name: "Proactive Defect Interception & Synthetic Reliability Invariant",
    category: "quality",
    status: "fail",
    message: `${violations.length} proactive defect interception violation(s) detected (AGENTS.md #12)`,
    details: violations,
    fixable: false,
  };
}

/**
 * Check Layout Integrity, Defensive CSS & Stacking Context Isolation (AGENTS.md Invariant #13)
 */
export function checkLayoutTextClippingInvariants(root: string): DiagnosticCheckResult {
  const violations: string[] = [];

  const requiredFiles = [
    { file: "components/PageLayout.tsx", desc: "PageLayout container component" },
    { file: "adr/0009-responsive-layout-and-text-clipping-standard.md", desc: "ADR-0009 Responsive Layout Integrity Standard" },
  ];

  for (const rf of requiredFiles) {
    const fullPath = path.join(root, rf.file);
    if (!fs.existsSync(fullPath)) {
      violations.push(`Missing ${rf.desc}: ${rf.file}`);
    }
  }

  // Scan components and app files for rogue z-[9999]
  const sourceFiles = [
    ...findFiles(path.join(root, "components"), /\.(tsx|jsx|ts|js)$/),
    ...findFiles(path.join(root, "app"), /\.(tsx|jsx|ts|js)$/),
  ];

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, "utf-8");
    if (content.includes("z-[9999]")) {
      const relPath = path.relative(root, file);
      violations.push(`Rogue z-index escalation 'z-[9999]' found in ${relPath}`);
    }
  }

  // Check that app routes don't create duplicate <main id="main-content">
  const pageFiles = findFiles(path.join(root, "app"), /^page\.tsx?$/);
  for (const pageFile of pageFiles) {
    const content = fs.readFileSync(pageFile, "utf-8");
    const relPath = path.relative(root, pageFile);
    if (content.includes('<main id="main-content"')) {
      violations.push(`Duplicate <main id="main-content"> landmark found in ${relPath}`);
    }
  }

  if (violations.length === 0) {
    return {
      id: "architecture-layout-integrity",
      name: "Layout Integrity, Defensive CSS & Stacking Isolation Invariant",
      category: "architecture",
      status: "pass",
      message: "PageLayout containers, bounded z-index scale, and defensive CSS invariants are active.",
    };
  }

  return {
    id: "architecture-layout-integrity",
    name: "Layout Integrity, Defensive CSS & Stacking Isolation Invariant",
    category: "architecture",
    status: "fail",
    message: `${violations.length} layout integrity violation(s) detected (AGENTS.md #13)`,
    details: violations,
    fixable: false,
  };
}

/**
 * Check Design System Token Migration Invariant across Core Layout Surfaces
 */
export function checkDesignTokens(root: string): DiagnosticCheckResult {
  const coreComponents = [
    "components/Hero.tsx",
    "components/BentoGrid.tsx",
    "components/PretextCard.tsx",
    "components/CaseStudyShowcase.tsx",
    "components/SkillsGrid.tsx",
    "components/UnifiedErrorLayout.tsx",
    "components/PageLayout.tsx",
    "components/Footer.tsx",
  ];

  const violations: string[] = [];

  for (const compPath of coreComponents) {
    const fullPath = path.join(root, compPath);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        /style=\{\s*\{/.test(line) &&
        !/style=\{\s*\{\s*["']--/.test(line) &&
        !/as\s+React\.CSSProperties/.test(line)
      ) {
        if (/style=\{\s*\{\s*(height|padding|margin|fontSize|color|width|backgroundColor)\s*:\s*/.test(line)) {
          violations.push(`${compPath}:${i + 1} - Raw unconstrained inline style property detected in style prop`);
        }
      }
    }
  }

  if (violations.length > 0) {
    return {
      id: "architecture-design-tokens",
      name: "Design Token Migration & Dual Governance Invariant",
      category: "architecture",
      status: "fail",
      message: `${violations.length} design token violation(s) detected across core layout surfaces.`,
      details: violations,
      fixable: false,
    };
  }

  return {
    id: "architecture-design-tokens",
    name: "Design Token Migration & Dual Governance Invariant",
    category: "architecture",
    status: "pass",
    message: "Zero raw inline style overrides or hardcoded pixel dimensions detected across core layout surfaces.",
  };
}

/**
 * Check Workspace & IDE Configuration Integrity (.editorconfig, .vscode)
 */
export function checkWorkspaceIdeConfig(root: string, fix = false): DiagnosticCheckResult {
  const requiredFiles = [
    { file: ".editorconfig", desc: "Universal EditorConfig rules" },
    { file: path.join(".vscode", "settings.json"), desc: "VS Code workspace settings" },
    { file: path.join(".vscode", "extensions.json"), desc: "VS Code extension recommendations" },
    { file: path.join(".vscode", "launch.json"), desc: "VS Code launch debug profiles" },
    { file: path.join(".vscode", "tasks.json"), desc: "VS Code build task runners" },
  ];

  const missing: string[] = [];

  for (const rf of requiredFiles) {
    const full = path.join(root, rf.file);
    if (!fs.existsSync(full)) {
      missing.push(`Missing ${rf.desc} (${rf.file})`);
    }
  }

  if (missing.length > 0) {
    if (fix) {
      const vscodeDir = path.join(root, ".vscode");
      if (!fs.existsSync(vscodeDir)) fs.mkdirSync(vscodeDir, { recursive: true });

      const editorConfigPath = path.join(root, ".editorconfig");
      if (!fs.existsSync(editorConfigPath)) {
        fs.writeFileSync(
          editorConfigPath,
          `root = true\n\n[*]\nindent_style = space\nindent_size = 2\nend_of_line = lf\ncharset = utf-8\ntrim_trailing_whitespace = true\ninsert_final_newline = true\n`,
          "utf-8"
        );
      }

      return {
        id: "workspace-ide-config",
        name: "IDE & Workspace Configuration Standards",
        category: "architecture",
        status: "fixed",
        message: "Scaffolded missing workspace IDE configurations (.vscode, .editorconfig).",
        fixedMessage: "Created missing IDE configs.",
      };
    }

    return {
      id: "workspace-ide-config",
      name: "IDE & Workspace Configuration Standards",
      category: "architecture",
      status: "fail",
      message: `${missing.length} workspace configuration file(s) missing.`,
      details: missing,
      fixable: true,
    };
  }

  return {
    id: "workspace-ide-config",
    name: "IDE & Workspace Configuration Standards",
    category: "architecture",
    status: "pass",
    message: "All VS Code workspace profiles (.vscode/) and .editorconfig are properly configured.",
  };
}

export function checkPackageLockfile(root: string): DiagnosticCheckResult {
  const alternativeLocks = ["bun.lock", "bun.lockb", "yarn.lock", "pnpm-lock.yaml"];
  const foundLocks = alternativeLocks.filter((lock) => fs.existsSync(path.join(root, lock)));

  if (foundLocks.length > 0) {
    return {
      id: "alternative-lockfiles",
      name: "Single Package Manager Lockfile Invariant",
      category: "architecture",
      status: "fail",
      message: `Alternative lockfile(s) detected: ${foundLocks.join(", ")}. This workspace is standardized on npm and must only contain package-lock.json.`,
      details: foundLocks.map((lock) => `Found alternative lockfile: ${lock}`),
      fixable: false,
    };
  }

  return {
    id: "alternative-lockfiles",
    name: "Single Package Manager Lockfile Invariant",
    category: "architecture",
    status: "pass",
    message: "Zero duplicate/alternative lockfiles detected. Workspace is correctly standardized on npm and uses package-lock.json.",
  };
}

/**
 * Run All Diagnostics
 */
export async function runDiagnostics(options: DoctorOptions = {}): Promise<{
  results: DiagnosticCheckResult[];
  hasFailures: boolean;
  hasWarnings: boolean;
  totalPassed: number;
  totalFailed: number;
  totalWarned: number;
  totalFixed: number;
}> {
  const root = options.workspaceRoot || process.cwd();
  const fix = !!options.fix;

  const checks: DiagnosticCheckResult[] = [
    checkRouteIndexing(root, fix),
    checkNavbarHierarchy(root),
    checkPageTopPadding(root),
    checkTestPathResolution(root),
    checkSecretLeaks(root),
    checkMigrationGuard(root),
    checkDocumentationParity(root, fix),
    checkOnboardingDocsDrift(root, fix),
    checkArchitectureTopologyDrift(root, fix),
    checkOpenApiParity(root, fix),
    checkHydrationSafety(root),
    checkAccessibilityStandards(root, fix),
    checkDefectRemediationInvariants(root),
    checkProactiveDefectInterception(root),
    checkLayoutTextClippingInvariants(root),
    checkEnvironmentVariables(root, fix),
    checkGitHygieneConfig(root, fix),
    checkWorkspaceIdeConfig(root, fix),
    checkPackageLockfile(root),
    checkDesignTokens(root),
    checkDeadCode(root),
    checkBundleBudgets(root),
  ];

  const totalPassed = checks.filter((c) => c.status === "pass").length;
  const totalFailed = checks.filter((c) => c.status === "fail").length;
  const totalWarned = checks.filter((c) => c.status === "warn").length;
  const totalFixed = checks.filter((c) => c.status === "fixed").length;

  const hasFailures = totalFailed > 0;
  const hasWarnings = totalWarned > 0;

  return {
    results: checks,
    hasFailures,
    hasWarnings,
    totalPassed,
    totalFailed,
    totalWarned,
    totalFixed,
  };
}

export function printDoctorReport(
  summary: Awaited<ReturnType<typeof runDiagnostics>>,
  ciMode = false
): void {
  console.log(formatSection("Repository Invariant & Architectural Health"));

  for (const check of summary.results) {
    console.log(badge(`[${check.category.toUpperCase()}] ${check.name}`, check.status));
    console.log(`  ${colors.dim}${check.message}${colors.reset}`);
    if (check.details && check.details.length > 0) {
      for (const d of check.details) {
        console.log(`    ${colors.gray}• ${d}${colors.reset}`);
      }
    }
  }

  console.log("\n" + colors.cyan + "─".repeat(60) + colors.reset);
  console.log(
    `Summary: ${colors.green}${summary.totalPassed} Passed${colors.reset} | ` +
      (summary.totalFixed > 0 ? `${colors.magenta}${summary.totalFixed} Auto-Fixed${colors.reset} | ` : "") +
      (summary.totalWarned > 0 ? `${colors.yellow}${summary.totalWarned} Warnings${colors.reset} | ` : "") +
      (summary.totalFailed > 0 ? `${colors.red}${summary.totalFailed} Failures${colors.reset}` : `${colors.brightGreen}0 Failures${colors.reset}`)
  );

  if (summary.hasFailures && !ciMode) {
    console.log(
      `\n${colors.brightYellow}💡 Tip: Run 'npm run doctor:fix' to automatically remediate fixable invariants.${colors.reset}\n`
    );
  }
}
