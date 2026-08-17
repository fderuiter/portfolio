import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs";
import os from "os";
import {
  checkRouteIndexing,
  checkNavbarHierarchy,
  checkPageTopPadding,
  checkTestPathResolution,
  checkSecretLeaks,
  checkMigrationGuard,
  checkHydrationSafety,
  checkAccessibilityStandards,
  checkDocumentationParity,
  checkOpenApiParity,
  checkDefectRemediationInvariants,
  checkLockfileSync,
  runDiagnostics,
  printDoctorReport,
} from "@/lib/dx/doctor";

describe("DX Invariant Doctor Engine", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dx-doctor-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("checkRouteIndexing", () => {
    it("fails when a route page is not registered in CommandPalette.tsx", () => {
      // Setup fake workspace with app/arcade/cyber-dash/page.tsx and un-indexed CommandPalette
      const appArcadeDir = path.join(tempDir, "app", "arcade", "cyber-dash");
      fs.mkdirSync(appArcadeDir, { recursive: true });
      fs.writeFileSync(path.join(appArcadeDir, "page.tsx"), "export default function Page() { return null; }");

      const compDir = path.join(tempDir, "components");
      fs.mkdirSync(compDir, { recursive: true });
      fs.writeFileSync(
        path.join(compDir, "CommandPalette.tsx"),
        'const staticNavs: PaletteItem[] = [\n      { id: "nav-work", url: "/#work" }\n    ];'
      );

      const result = checkRouteIndexing(tempDir, false);
      expect(result.status).toBe("fail");
      expect(result.message).toContain("1 route(s) not registered");
      expect(result.details?.[0]).toContain("/arcade/cyber-dash");
    });

    it("auto-fixes missing route registrations when fix=true", () => {
      const appArcadeDir = path.join(tempDir, "app", "arcade", "cyber-dash");
      fs.mkdirSync(appArcadeDir, { recursive: true });
      fs.writeFileSync(path.join(appArcadeDir, "page.tsx"), "export default function Page() { return null; }");

      const compDir = path.join(tempDir, "components");
      fs.mkdirSync(compDir, { recursive: true });
      fs.writeFileSync(
        path.join(compDir, "CommandPalette.tsx"),
        'const staticNavs: PaletteItem[] = [\n      { id: "nav-work", url: "/#work" }\n    ];'
      );

      const fixResult = checkRouteIndexing(tempDir, true);
      expect(fixResult.status).toBe("fixed");

      // Verify file was written
      const updatedPalette = fs.readFileSync(path.join(compDir, "CommandPalette.tsx"), "utf-8");
      expect(updatedPalette).toContain('url: "/arcade/cyber-dash"');
    });
  });

  describe("checkNavbarHierarchy", () => {
    it("fails if a subpage imports or mounts <Navbar />", () => {
      const appDir = path.join(tempDir, "app", "arcade");
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(
        path.join(appDir, "page.tsx"),
        'import { Navbar } from "@/components/Navbar";\nexport default function Page() { return <Navbar />; }'
      );

      const result = checkNavbarHierarchy(tempDir);
      expect(result.status).toBe("fail");
      expect(result.message).toContain("Secondary <Navbar />");
    });

    it("passes when Navbar is only in app/layout.tsx", () => {
      const appDir = path.join(tempDir, "app");
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(
        path.join(appDir, "layout.tsx"),
        'import { Navbar } from "@/components/Navbar";\nexport default function Layout() { return <Navbar />; }'
      );
      fs.writeFileSync(
        path.join(appDir, "page.tsx"),
        'export default function Page() { return <main>Content</main>; }'
      );

      const result = checkNavbarHierarchy(tempDir);
      expect(result.status).toBe("pass");
    });
  });

  describe("checkTestPathResolution", () => {
    it("fails if tests contain hardcoded root paths", () => {
      const testsDir = path.join(tempDir, "__tests__");
      fs.mkdirSync(testsDir, { recursive: true });
      fs.writeFileSync(
        path.join(testsDir, "bad.test.ts"),
        'const root = ' + '"/app/config.json";'
      );

      const result = checkTestPathResolution(tempDir);
      expect(result.status).toBe("fail");
      expect(result.details?.[0]).toContain("bad.test.ts");
    });

    it("passes when tests use process.cwd() or path.resolve", () => {
      const testsDir = path.join(tempDir, "__tests__");
      fs.mkdirSync(testsDir, { recursive: true });
      fs.writeFileSync(
        path.join(testsDir, "good.test.ts"),
        'const root = path.resolve(process.cwd(), "config.json");'
      );

      const result = checkTestPathResolution(tempDir);
      expect(result.status).toBe("pass");
    });
  });

  describe("checkSecretLeaks", () => {
    it("detects secret patterns", () => {
      const secretFile = path.join(tempDir, "leaked.ts");
      fs.writeFileSync(secretFile, 'const key = "' + 'ghp_' + '123456789012345678901234567890123456";');

      const result = checkSecretLeaks(tempDir);
      expect(result.status).toBe("fail");
    });
  });

  describe("checkMigrationGuard", () => {
    it("flags destructive DROP COLUMN statement without override", () => {
      const migDir = path.join(tempDir, "prisma", "migrations", "20260814_test");
      fs.mkdirSync(migDir, { recursive: true });
      fs.writeFileSync(path.join(migDir, "migration.sql"), "ALTER TABLE users DROP COLUMN password;");

      const result = checkMigrationGuard(tempDir);
      expect(result.status).toBe("fail");
      expect(result.details?.[0]).toContain("DROP COLUMN");
    });
  });

  describe("checkPageTopPadding", () => {
    it("flags pages missing header clearance top padding", () => {
      const appDir = path.join(tempDir, "app", "demo");
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(path.join(appDir, "page.tsx"), "export default function Page() { return <div>No padding</div>; }");

      const result = checkPageTopPadding(tempDir);
      expect(result.status).toBe("warn");
      expect(result.details?.[0]).toContain("demo");
    });

    it("passes when pages include header clearance top padding", () => {
      const appDir = path.join(tempDir, "app", "demo");
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(path.join(appDir, "page.tsx"), "export default function Page() { return <main className='pt-28'>Content</main>; }");

      const result = checkPageTopPadding(tempDir);
      expect(result.status).toBe("pass");
    });
  });

  describe("checkDocumentationParity", () => {
    it("fails if docs directory is missing", () => {
      const result = checkDocumentationParity(tempDir, false);
      expect(result.status).toBe("fail");
      expect(result.message).toContain("docs/ directory does not exist");
    });

    it("passes when docs directory exists without drift", () => {
      const docsDir = path.join(tempDir, "docs");
      fs.mkdirSync(docsDir, { recursive: true });
      fs.writeFileSync(path.join(docsDir, "README.md"), "# Docs");

      const result = checkDocumentationParity(tempDir, false);
      expect(result.status).toBe("pass");
    });
  });

  describe("checkOpenApiParity", () => {
    it("warns if openapi.json or generator script is missing", () => {
      const result = checkOpenApiParity(tempDir, false);
      expect(result.status).toBe("warn");
      expect(result.message).toContain("not found");
    });

    it("fails when an app/api route is missing from openapi.json", () => {
      const apiDir = path.join(tempDir, "app", "api", "metrics");
      fs.mkdirSync(apiDir, { recursive: true });
      fs.writeFileSync(path.join(apiDir, "route.ts"), "export async function GET() { return null; }");

      const scriptsDir = path.join(tempDir, "scripts");
      fs.mkdirSync(scriptsDir, { recursive: true });
      fs.writeFileSync(path.join(scriptsDir, "generate-openapi.ts"), "// generator");

      fs.writeFileSync(
        path.join(tempDir, "openapi.json"),
        JSON.stringify({ openapi: "3.0.0", paths: { "/api/other": {} } })
      );

      const result = checkOpenApiParity(tempDir, false);
      expect(result.status).toBe("fail");
      expect(result.message).toContain("1 route(s) missing from openapi.json");
      expect(result.details?.[0]).toContain("/api/metrics");
    });

    it("passes when all app/api routes are documented in openapi.json", () => {
      const apiDir = path.join(tempDir, "app", "api", "telemetry");
      fs.mkdirSync(apiDir, { recursive: true });
      fs.writeFileSync(path.join(apiDir, "route.ts"), "export async function GET() { return null; }");

      const scriptsDir = path.join(tempDir, "scripts");
      fs.mkdirSync(scriptsDir, { recursive: true });
      fs.writeFileSync(path.join(scriptsDir, "generate-openapi.ts"), "// generator");

      fs.writeFileSync(
        path.join(tempDir, "openapi.json"),
        JSON.stringify({ openapi: "3.0.0", paths: { "/api/telemetry": {} } })
      );

      const result = checkOpenApiParity(tempDir, false);
      expect(result.status).toBe("pass");
      expect(result.message).toContain("All app/api routes are documented");
    });
  });

  describe("checkAccessibilityStandards", () => {
    it("fails when app/layout.tsx is missing skip link, main landmark, or announcer provider", () => {
      const appDir = path.join(tempDir, "app");
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(
        path.join(appDir, "layout.tsx"),
        "export default function Layout({ children }: { children: React.ReactNode }) { return <div>{children}</div>; }"
      );

      const result = checkAccessibilityStandards(tempDir, false);
      expect(result.status).toBe("fail");
      expect(result.details?.length).toBeGreaterThan(0);
    });

    it("passes when app/layout.tsx satisfies all accessibility landmark requirements", () => {
      const appDir = path.join(tempDir, "app");
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(
        path.join(appDir, "layout.tsx"),
        `import { SkipToContent } from "@/components/SkipToContent";
import { A11yProvider } from "@/components/providers/A11yProvider";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <body>
      <SkipToContent />
      <A11yProvider>
        <main id="main-content">{children}</main>
      </A11yProvider>
    </body>
  );
}`
      );

      const result = checkAccessibilityStandards(tempDir, false);
      expect(result.status).toBe("pass");
    });

    it("auto-fixes missing skip link and main landmarks when fix=true", () => {
      const appDir = path.join(tempDir, "app");
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(
        path.join(appDir, "layout.tsx"),
        `import { A11yProvider } from "@/components/providers/A11yProvider";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <body>
      <A11yProvider>
        <div className="flex-grow flex flex-col">{children}</div>
      </A11yProvider>
    </body>
  );
}`
      );

      const fixResult = checkAccessibilityStandards(tempDir, true);
      expect(fixResult.status).toBe("fixed");

      const updated = fs.readFileSync(path.join(appDir, "layout.tsx"), "utf-8");
      expect(updated).toContain("SkipToContent");
      expect(updated).toContain('id="main-content"');
    });
  });

  describe("checkHydrationSafety", () => {
    it("passes when no hydration anti-patterns are found", () => {
      const compDir = path.join(tempDir, "components");
      fs.mkdirSync(compDir, { recursive: true });
      fs.writeFileSync(
        path.join(compDir, "TestComp.tsx"),
        "export function TestComp() { return <div>Static text</div>; }"
      );

      const result = checkHydrationSafety(tempDir);
      expect(result.status).toBe("pass");
    });

    it("warns when unsuppressed Math.random is found in JSX", () => {
      const compDir = path.join(tempDir, "components");
      fs.mkdirSync(compDir, { recursive: true });
      fs.writeFileSync(
        path.join(compDir, "TestComp.tsx"),
        "export function TestComp() { return <div>{Math.random()}</div>; }"
      );

      const result = checkHydrationSafety(tempDir);
      expect(result.status).toBe("warn");
      expect(result.details?.[0]).toContain("Math.random()");
    });
  });

  describe("checkDefectRemediationInvariants", () => {
    it("fails when regression test suite or ADR 0007 are missing", () => {
      const result = checkDefectRemediationInvariants(tempDir);
      expect(result.status).toBe("fail");
      expect(result.message).toContain("defect remediation invariant violation");
    });

    it("passes when all computational engines and regression suites are verified", () => {
      const workspaceRoot = path.resolve(__dirname, "..");
      const result = checkDefectRemediationInvariants(workspaceRoot);
      expect(result.status).toBe("pass");
      expect(result.category).toBe("quality");
    });
  });

  describe("checkLockfileSync", () => {
    it("fails when lockfiles are desynchronized", () => {
      // Setup mock package.json, package-lock.json, bun.lock
      fs.writeFileSync(
        path.join(tempDir, "package.json"),
        JSON.stringify({
          dependencies: {
            "isomorphic-dompurify": "^3.19.0",
          },
        })
      );
      fs.writeFileSync(
        path.join(tempDir, "package-lock.json"),
        JSON.stringify({
          packages: {
            "node_modules/isomorphic-dompurify": {
              version: "3.22.0",
            },
          },
        })
      );
      fs.writeFileSync(
        path.join(tempDir, "bun.lock"),
        JSON.stringify({
          packages: {
            "isomorphic-dompurify": ["isomorphic-dompurify@3.14.0", "", {}],
          },
        })
      );

      const result = checkLockfileSync(tempDir, false);
      expect(result.status).toBe("fail");
      expect(result.message).toContain("Lockfiles are desynchronized!");
      expect(result.details?.[0]).toContain("isomorphic-dompurify");
    });

    it("passes when lockfiles have identical resolved versions", () => {
      fs.writeFileSync(
        path.join(tempDir, "package.json"),
        JSON.stringify({
          dependencies: {
            "isomorphic-dompurify": "^3.19.0",
          },
        })
      );
      fs.writeFileSync(
        path.join(tempDir, "package-lock.json"),
        JSON.stringify({
          packages: {
            "node_modules/isomorphic-dompurify": {
              version: "3.22.0",
            },
          },
        })
      );
      fs.writeFileSync(
        path.join(tempDir, "bun.lock"),
        JSON.stringify({
          packages: {
            "isomorphic-dompurify": ["isomorphic-dompurify@3.22.0", "", {}],
          },
        })
      );

      const result = checkLockfileSync(tempDir, false);
      expect(result.status).toBe("pass");
    });
  });

  describe("Full Workspace Health Diagnostic", () => {
    it("runs diagnostic across active workspace cleanly and prints reports", async () => {
      const workspaceRoot = path.resolve(__dirname, "..");
      const summary = await runDiagnostics({ workspaceRoot, fix: false, ci: true });
      expect(summary.results.length).toBeGreaterThan(0);
      expect(summary.totalPassed).toBeGreaterThan(0);

      expect(() => printDoctorReport(summary, true)).not.toThrow();

      // Test report with fake failures and fixes
      const mockSummary = {
        ...summary,
        totalFixed: 1,
        totalWarned: 1,
        totalFailed: 1,
        hasFailures: true,
        results: [
          {
            id: "fake-check",
            name: "Fake Invariant",
            category: "routes" as const,
            status: "fail" as const,
            message: "Missing mock route",
            details: ["/mock/path"],
          },
        ],
      };
      expect(() => printDoctorReport(mockSummary, false)).not.toThrow();
    }, 20000);
  });
});
