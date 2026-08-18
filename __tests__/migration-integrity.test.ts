/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, expect, it } from "vitest";

// The production guard is CommonJS because it runs directly under Node.
const {
  getLockProvider,
  getSchemaProvider,
  validateMigrationFiles,
} = require("../scripts/check-migration-integrity.js");

const {
  runUnifiedMigrationCheck,
  checkDestructiveMigrations,
} = require("../scripts/check-migrations.js");

describe("Prisma migration integrity", () => {
  it("reads the provider from a Prisma datasource block", () => {
    expect(
      getSchemaProvider(`
        generator client { provider = "prisma-client" }
        datasource db {
          provider = "postgresql"
        }
      `),
    ).toBe("postgresql");
  });

  it("reads the provider from the migration lock", () => {
    expect(getLockProvider('provider = "postgresql"')).toBe("postgresql");
  });

  it("validates every checked-in migration file", () => {
    expect(validateMigrationFiles("prisma/migrations")).toEqual([
      "20260417215437_init",
      "20260528000000_add_telemetry_event",
      "20260814000000_add_simulated_telemetry",
      "20260818000000_add_feedback_and_reactions",
      "20261014000000_add_commands_and_playback",
    ]);
  });

  it("rejects a datasource with no literal provider", () => {
    expect(() => getSchemaProvider("datasource db { url = env(\"DATABASE_URL\") }")).toThrow(
      "Could not read the datasource provider",
    );
  });

  it("executes unified migration validator cleanly across current codebase", () => {
    expect(() => runUnifiedMigrationCheck()).not.toThrow();
  });

  it("detects destructive migrations when present and respects override flag", () => {
    const fs = require("fs");
    const path = require("path");
    const os = require("os");

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "migration-test-"));
    const migrationDir = path.join(tmpDir, "20260901_drop_test");
    fs.mkdirSync(migrationDir, { recursive: true });
    fs.writeFileSync(path.join(migrationDir, "migration.sql"), "ALTER TABLE \"CaseStudy\" DROP COLUMN \"title\";");

    expect(() => checkDestructiveMigrations(tmpDir, false)).toThrow("Destructive migrations are blocked");
    expect(() => checkDestructiveMigrations(tmpDir, true)).not.toThrow();

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
