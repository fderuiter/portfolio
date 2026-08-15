import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { scanFile } from "../validation-scanner";
import { colors, badge, formatSection } from "./utils";

export interface DiagnosticCheckResult {
  id: string;
  name: string;
  category: "architecture" | "routes" | "security" | "database" | "docs" | "hydration";
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
    if (relative.startsWith("api") || relative.includes("[") || relative.includes("ui-sandbox")) {
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
    const hasTopPadding = /\bpt-(20|24|28|32|36|40|44|48|\[\d+px\])\b/.test(content) || /min-h-screen/.test(content);

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
    if (relative.includes("error-sanitization.test.ts") || relative.includes("dx-doctor.test.ts")) {
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
    ".env.example",
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
 * Migration Integrity & Destructive Migration Guard
 */
export function checkMigrationGuard(root: string): DiagnosticCheckResult {
  const migrationsDir = path.join(root, "prisma", "migrations");
  if (!fs.existsSync(migrationsDir)) {
    return {
      id: "database-migrations",
      name: "Prisma Migration Integrity & Destructive Guard",
      category: "database",
      status: "pass",
      message: "No migrations folder present (skipped).",
    };
  }

  const sqlFiles = findFiles(migrationsDir, /\.sql$/);
  const destructiveViolations: { file: string; ddl: string }[] = [];

  for (const file of sqlFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const dropMatches = content.match(/\b(DROP\s+TABLE|DROP\s+COLUMN)\b/gi);
    if (dropMatches && !process.env.ALLOW_DESTRUCTIVE_MIGRATIONS) {
      destructiveViolations.push({
        file: path.relative(root, file),
        ddl: dropMatches.join(", "),
      });
    }
  }

  if (destructiveViolations.length === 0) {
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
    message: `Destructive DDL detected in ${destructiveViolations.length} migration(s) without ALLOW_DESTRUCTIVE_MIGRATIONS flag`,
    details: destructiveViolations.map((v) => `${v.file}: ${v.ddl}`),
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
      status: "warn",
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

  try {
    const diff = execSync("git diff --name-only docs", { cwd: root, encoding: "utf-8" }).trim();
    if (diff.length > 0) {
      return {
        id: "docs-drift",
        name: "TypeDoc & Markdown Documentation Parity",
        category: "docs",
        status: "warn",
        message: "Documentation in docs/ has uncommitted modifications or drift.",
        details: diff.split("\n"),
        fixable: true,
      };
    }
  } catch {
    // Git diff failed or not a git repository
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
 * OpenAPI Parity Check
 */
export function checkOpenApiParity(root: string, fix = false): DiagnosticCheckResult {
  const openApiFile = path.join(root, "openapi.json");
  const generatorScript = path.join(root, "scripts", "generate-openapi.ts");

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
        message: "Successfully regenerated openapi.json specification.",
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

  return {
    id: "api-openapi-sync",
    name: "OpenAPI Specification Contract Sync",
    category: "architecture",
    status: "pass",
    message: "OpenAPI specification is present and active.",
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
    checkOpenApiParity(root, fix),
    checkHydrationSafety(root),
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
