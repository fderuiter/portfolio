import { describe, it, expect } from "vitest";
import { scanText, scanFile } from "../lib/validation-scanner";
import { shouldScanFile } from "../scripts/validate-commit";

describe("Static Regex Guards - scanText", () => {
  it("detects database connection string pattern with credentials", () => {
    const text = "We connected using postgresql://admin:superSecretPass123@db.example.com:5432/production";
    const matches = scanText(text);
    expect(matches).toHaveLength(1);
    expect(matches[0].category).toBe("Database Connection String (with credentials)");
    expect(matches[0].lineNumber).toBe(1);
    expect(matches[0].matchedText).toContain("postgresql://admin:superSecretPass123@db.example.com:5432/production");
  });

  it("detects database connection string pattern without credentials", () => {
    const text = "Connecting to postgresql://localhost:5432/my_local_db";
    const matches = scanText(text);
    expect(matches).toHaveLength(1);
    expect(matches[0].category).toBe("Database Connection Pattern");
    expect(matches[0].lineNumber).toBe(1);
  });

  it("detects generic secret and password patterns with high entropy", () => {
    const text = `
      const config = {
        api_key: "abc123xyz456foo199",
        someOtherField: "normal value"
      };
    `;
    const matches = scanText(text);
    expect(matches).toHaveLength(1);
    expect(matches[0].category).toBe("Generic API Key/Secret/Password");
    expect(matches[0].lineNumber).toBe(3);
  });

  it("detects AWS Access Keys", () => {
    const text = "Set environment variable AWS_ACCESS_KEY_ID = AKIAIOSFODNN7EXAMPLE";
    const matches = scanText(text);
    expect(matches).toHaveLength(1);
    expect(matches[0].category).toBe("AWS Access Key");
    expect(matches[0].lineNumber).toBe(1);
  });

  it("detects GitHub Access Tokens", () => {
    const text = "Check out using token: ghp_123456789012345678901234567890123456";
    const matches = scanText(text);
    expect(matches).toHaveLength(1);
    expect(matches[0].category).toBe("GitHub Access Token");
    expect(matches[0].lineNumber).toBe(1);
  });

  it("detects Private Keys", () => {
    const text = `
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0G...
-----END RSA PRIVATE KEY-----
    `;
    const matches = scanText(text);
    expect(matches).toHaveLength(1);
    expect(matches[0].category).toBe("Private Key (PEM)");
    expect(matches[0].lineNumber).toBe(2);
  });

  it("does not trigger on safe text and code", () => {
    const text = `
      import dotenv from "dotenv";
      const connectionString = process.env.DATABASE_URL;
      const api_key = "short"; // Too short to match high entropy regex limit of 16
      console.log("Welcome to the Portfolio App");
    `;
    const matches = scanText(text);
    expect(matches).toHaveLength(0);
  });

  it("detects generic secret patterns in template literals (backticks)", () => {
    const text = "const api_key = `superSecretToken12345`;";
    const matches = scanText(text);
    expect(matches).toHaveLength(1);
    expect(matches[0].category).toBe("Generic API Key/Secret/Password");
    expect(matches[0].lineNumber).toBe(1);
  });

  it("handles scanFile on non-existent or empty files gracefully", () => {
    const matchesNonExistent = scanFile("this-file-does-not-exist.txt");
    expect(matchesNonExistent).toEqual([]);
  });

  describe("Pre-Commit Git Guard - shouldScanFile", () => {
    it("returns false for ignored extensions", () => {
      expect(shouldScanFile("image.png")).toBe(false);
      expect(shouldScanFile("icon.ico")).toBe(false);
      expect(shouldScanFile("video.mp4")).toBe(false);
    });

    it("returns false for ignored file names", () => {
      expect(shouldScanFile("package-lock.json")).toBe(false);
      expect(shouldScanFile("bun.lock")).toBe(false);
    });

    it("returns false for ignored directories", () => {
      expect(shouldScanFile("node_modules/lodash/index.js")).toBe(false);
      expect(shouldScanFile("foo/node_modules/bar.js")).toBe(false);
      expect(shouldScanFile(".next/server/page.js")).toBe(false);
      expect(shouldScanFile("__tests__/validation.test.ts")).toBe(false);
    });

    it("returns true for regular source files", () => {
      expect(shouldScanFile("lib/auth.ts")).toBe(true);
      expect(shouldScanFile("app/dashboard/page.tsx")).toBe(true);
      expect(shouldScanFile("scripts/seed.js")).toBe(true);
    });
  });
});
