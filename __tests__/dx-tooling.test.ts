import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";
import { validateEnv } from "../lib/env";
import {
  validateCommitMessage,
  validateBranchName,
  checkGitHygieneConfig,
} from "../lib/dx/git-guard";
import {
  getDeclaredEnvKeys,
  parseEnvFile,
  generateEnvExampleContent,
  checkEnvironmentVariables,
} from "../lib/dx/env-guard";
import { extractExports, scanDeadCode, checkDeadCode } from "../lib/dx/dead-code";
import { inspectBundleChunks, checkBundleBudgets } from "../lib/dx/bundle-guard";
import { checkWorkspaceIdeConfig } from "../lib/dx/doctor";

describe("Developer Experience (DX) Tooling Suite", () => {
  const root = path.resolve(process.cwd());

  describe("1. Environment Schema & Drift Sentinel", () => {
    it("validates server and client environment schemas", () => {
      const validMockEnv = {
        NODE_ENV: "development",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        UPSTASH_REDIS_REST_URL: "https://redis.upstash.io",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      };

      const result = validateEnv(validMockEnv);
      expect(result.success).toBe(true);
      expect(result.data.DATABASE_URL).toBe("postgresql://user:pass@localhost:5432/db");
      expect(result.data.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    });

    it("catches malformed environment variables", () => {
      const invalidMockEnv = {
        UPSTASH_REDIS_REST_URL: "not-a-valid-url",
        NEXT_PUBLIC_APP_URL: "also-not-a-url",
      };

      const result = validateEnv(invalidMockEnv);
      expect(result.success).toBe(false);
      expect(result.errors["UPSTASH_REDIS_REST_URL"]).toBeDefined();
      expect(result.errors["NEXT_PUBLIC_APP_URL"]).toBeDefined();
    });

    it("extracts all declared schema keys", () => {
      const { serverKeys, clientKeys, allKeys } = getDeclaredEnvKeys();
      expect(serverKeys).toContain("DATABASE_URL");
      expect(serverKeys).toContain("CRON_SECRET");
      expect(clientKeys).toContain("NEXT_PUBLIC_APP_URL");
      expect(allKeys.length).toBeGreaterThan(5);
    });

    it("parses .env key-value pairs accurately", () => {
      const sample = `
        # Comment line
        DATABASE_URL="postgresql://localhost:5432/db"
        PORT=3000
        EMPTY=
      `;
      const tempPath = path.join(root, "scratch", "temp-env-test.env");
      fs.mkdirSync(path.dirname(tempPath), { recursive: true });
      fs.writeFileSync(tempPath, sample, "utf-8");

      const parsed = parseEnvFile(tempPath);
      expect(parsed.DATABASE_URL).toBe("postgresql://localhost:5432/db");
      expect(parsed.PORT).toBe("3000");
      expect(parsed.EMPTY).toBe("");

      fs.unlinkSync(tempPath);
    });

    it("generates a clean .env.example without leaking secrets", () => {
      const generated = generateEnvExampleContent();
      expect(generated).toContain("DATABASE_URL=");
      expect(generated).toContain("UPSTASH_REDIS_REST_URL=");
      expect(generated).not.toContain("npg_mN8oCAGrRM0E"); // Must never contain production passwords
    });

    it("passes checkEnvironmentVariables diagnostic check", () => {
      const result = checkEnvironmentVariables(root, false);
      expect(result.status).toBe("pass");
      expect(result.id).toBe("env-schema-parity");
    });
  });

  describe("2. Conventional Commits & Git Hygiene Guard", () => {
    it("validates compliant Conventional Commit messages", () => {
      const validMessages = [
        "feat(proof): add modus ponens inference operator",
        "fix(dx): resolve doctor environment parity check",
        "docs: update architecture diagrams",
        "dx(cli): enhance interactive commit wizard",
        "refactor(crf): simplify recursive descent AST evaluator",
        "perf(layout): optimize pretext canvas caching",
        "test(engine): add property fuzzing for deduction ledger",
        "chore(deps): bump tailwindcss",
        "feat(auth)!: replace session cookie format",
      ];

      for (const msg of validMessages) {
        const result = validateCommitMessage(msg);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.parsed).toBeDefined();
      }
    });

    it("rejects non-compliant commit messages with actionable errors", () => {
      const invalidCases = [
        { msg: "", expected: "empty" },
        { msg: "Updated some files", expected: "Header must follow format" },
        { msg: "invalidtype: add something", expected: "Invalid type" },
        { msg: "feat: Upper Case Subject", expected: "lowercase" },
        { msg: "fix: ended with a period.", expected: "period" },
        {
          msg: "feat(very-long-scope): " + "a".repeat(110),
          expected: "exceeds 100 characters",
        },
      ];

      for (const { msg, expected } of invalidCases) {
        const result = validateCommitMessage(msg);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes(expected))).toBe(true);
      }
    });

    it("allows standard git merge and release commits", () => {
      expect(validateCommitMessage("Merge branch 'main' into feat/dx").valid).toBe(true);
      expect(validateCommitMessage("Revert \"feat: something broken\"").valid).toBe(true);
      expect(validateCommitMessage("v1.0.0").valid).toBe(true);
    });

    it("validates branch names against team conventions", () => {
      expect(validateBranchName("main").valid).toBe(true);
      expect(validateBranchName("feat/add-dx-suite").valid).toBe(true);
      expect(validateBranchName("fix/proof-ast-bug").valid).toBe(true);
      expect(validateBranchName("dx/commit-wizard").valid).toBe(true);

      const invalidBranch = validateBranchName("random_branch_name");
      expect(invalidBranch.valid).toBe(false);
      expect(invalidBranch.error).toContain("Expected prefixes");
    });

    it("passes checkGitHygieneConfig diagnostic check", () => {
      const result = checkGitHygieneConfig(root, false);
      expect(result.status).toBe("pass");
      expect(result.id).toBe("git-hygiene-config");
    });
  });

  describe("3. Dead Code & Export Scanner", () => {
    it("extracts named exports accurately from TypeScript source", () => {
      const sampleCode = `
        export const API_VERSION = "v1";
        export function computeTotal(a: number, b: number): number {
          return a + b;
        }
        export type UserRole = "admin" | "user";
        export interface ConfigOptions {
          debug: boolean;
        }
        export class EngineService {}
        export enum Status {
          Active = "ACTIVE"
        }
        export default function App() {}
      `;

      const exports = extractExports("/path/sample.ts", sampleCode);
      const names = exports.map((e) => e.name);

      expect(names).toContain("API_VERSION");
      expect(names).toContain("computeTotal");
      expect(names).toContain("UserRole");
      expect(names).toContain("ConfigOptions");
      expect(names).toContain("EngineService");
      expect(names).toContain("Status");
      expect(names).toContain("default");
    });

    it("scans workspace files and reports dead code findings cleanly", () => {
      const report = scanDeadCode(root);
      expect(report.totalScannedFiles).toBeGreaterThan(10);
      expect(report.totalExports).toBeGreaterThan(50);
      expect(Array.isArray(report.unusedExports)).toBe(true);
    });

    it("passes or cleanly warns in checkDeadCode diagnostic check", () => {
      const result = checkDeadCode(root);
      expect(["pass", "warn"]).toContain(result.status);
      expect(result.id).toBe("dead-code-scanner");
    });
  });

  describe("4. Bundle Performance Budget Guard", () => {
    it("inspects bundle chunks without throwing", () => {
      const report = inspectBundleChunks(root);
      expect(typeof report.isBuilt).toBe("boolean");
      expect(Array.isArray(report.chunks)).toBe(true);
      expect(Array.isArray(report.violations)).toBe(true);
    });

    it("passes checkBundleBudgets diagnostic check", () => {
      const result = checkBundleBudgets(root);
      expect(["pass", "warn"]).toContain(result.status);
      expect(result.id).toBe("bundle-performance-budgets");
    });
  });

  describe("5. IDE & Workspace Configuration Integrity", () => {
    it("verifies that all .vscode files and .editorconfig exist", () => {
      expect(fs.existsSync(path.join(root, ".editorconfig"))).toBe(true);
      expect(fs.existsSync(path.join(root, ".vscode", "settings.json"))).toBe(true);
      expect(fs.existsSync(path.join(root, ".vscode", "extensions.json"))).toBe(true);
      expect(fs.existsSync(path.join(root, ".vscode", "launch.json"))).toBe(true);
      expect(fs.existsSync(path.join(root, ".vscode", "tasks.json"))).toBe(true);
    });

    it("passes checkWorkspaceIdeConfig diagnostic check", () => {
      const result = checkWorkspaceIdeConfig(root, false);
      expect(result.status).toBe("pass");
      expect(result.id).toBe("workspace-ide-config");
    });
  });
});
