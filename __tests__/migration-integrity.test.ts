/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The production guard is CommonJS because it runs directly under Node.
const {
  getDocMigrations,
  getLockProvider,
  getSchemaProvider,
  validateDocMigrations,
  validateDocCommands,
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
      `)
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
      "20261015000000_add_email_resilience",
      "20261016000000_enforce_email_contracts",
    ]);
  });

  it("extracts migration identifiers from markdown documentation", () => {
    const sampleDoc = `
      # Database Migrations
      - \`20260417215437_init\`
      - \`20260528000000_add_telemetry_event\`
      Some random text with 20260814000000_add_simulated_telemetry in code block.
    `;
    expect(getDocMigrations(sampleDoc)).toEqual([
      "20260417215437_init",
      "20260528000000_add_telemetry_event",
      "20260814000000_add_simulated_telemetry",
    ]);
  });

  it("validates documentation parity against active repository migration assets", () => {
    expect(
      validateDocMigrations("DATABASE_MIGRATIONS.md", "prisma/migrations")
    ).toEqual([
      "20260417215437_init",
      "20260528000000_add_telemetry_event",
      "20260814000000_add_simulated_telemetry",
      "20260818000000_add_feedback_and_reactions",
      "20261014000000_add_commands_and_playback",
      "20261015000000_add_email_resilience",
      "20261016000000_enforce_email_contracts",
    ]);
  });

  it("keeps the email resilience migration additive, indexed, and upgrade-safe", () => {
    const migrationPath = resolve(
      process.cwd(),
      "prisma/migrations/20261015000000_add_email_resilience/migration.sql"
    );
    const migration = readFileSync(migrationPath, "utf8");

    expect(migration).toContain('CREATE TABLE IF NOT EXISTS "SuppressionList"');
    expect(migration).toContain('"email" TEXT NOT NULL');
    expect(migration).toContain('"reason" TEXT NOT NULL');
    expect(migration).toContain(
      'CREATE UNIQUE INDEX IF NOT EXISTS "SuppressionList_email_key"'
    );
    expect(migration).toContain(
      'CREATE INDEX IF NOT EXISTS "SuppressionList_email_idx"'
    );

    expect(migration).toContain(
      'CREATE TABLE IF NOT EXISTS "OutboundEmailQueue"'
    );
    expect(migration).toContain('"html" TEXT NOT NULL');
    expect(migration).toContain('"tags" JSONB');
    expect(migration).toContain('"attempts" INTEGER NOT NULL DEFAULT 0');
    expect(migration).toContain("\"status\" TEXT NOT NULL DEFAULT 'PENDING'");
    expect(migration).toContain(
      'CREATE INDEX IF NOT EXISTS "OutboundEmailQueue_status_nextRetryAt_idx"'
    );
    expect(migration).toContain(
      'CREATE INDEX IF NOT EXISTS "OutboundEmailQueue_createdAt_idx"'
    );
    expect(migration).not.toMatch(/DROP\s+(TABLE|COLUMN)/i);
  });

  it("fails drift check with diagnostic error when documentation misses a migration folder", () => {
    const fs = require("fs");
    const path = require("path");
    const os = require("os");

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-drift-test-"));
    const migrationsDir = path.join(tmpDir, "migrations");
    const docFile = path.join(tmpDir, "DATABASE_MIGRATIONS.md");

    const mig1 = path.join(migrationsDir, "20260101000000_first_migration");
    const mig2 = path.join(migrationsDir, "20260201000000_second_migration");
    fs.mkdirSync(mig1, { recursive: true });
    fs.mkdirSync(mig2, { recursive: true });
    fs.writeFileSync(path.join(mig1, "migration.sql"), "-- first");
    fs.writeFileSync(path.join(mig2, "migration.sql"), "-- second");

    fs.writeFileSync(
      docFile,
      "# Migrations\n- `20260101000000_first_migration`\n"
    );

    expect(() => validateDocMigrations(docFile, migrationsDir)).toThrowError(
      /Documentation drift detected/
    );
    expect(() => validateDocMigrations(docFile, migrationsDir)).toThrowError(
      /Missing in documentation: 20260201000000_second_migration/
    );

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("fails drift check with diagnostic error when documentation has mismatched or extra migrations", () => {
    const fs = require("fs");
    const path = require("path");
    const os = require("os");

    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "doc-drift-extra-test-")
    );
    const migrationsDir = path.join(tmpDir, "migrations");
    const docFile = path.join(tmpDir, "DATABASE_MIGRATIONS.md");

    const mig1 = path.join(migrationsDir, "20260101000000_first_migration");
    fs.mkdirSync(mig1, { recursive: true });
    fs.writeFileSync(path.join(mig1, "migration.sql"), "-- first");

    fs.writeFileSync(
      docFile,
      "# Migrations\n- `20260101000000_first_migration`\n- `20260909000000_obsolete_migration`\n"
    );

    expect(() => validateDocMigrations(docFile, migrationsDir)).toThrowError(
      /Extra\/mismatched in documentation: 20260909000000_obsolete_migration/
    );

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("rejects a datasource with no literal provider", () => {
    expect(() =>
      getSchemaProvider('datasource db { url = env("DATABASE_URL") }')
    ).toThrow("Could not read the datasource provider");
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
    fs.writeFileSync(
      path.join(migrationDir, "migration.sql"),
      'ALTER TABLE "CaseStudy" DROP COLUMN "title";'
    );

    expect(() => checkDestructiveMigrations(tmpDir, false)).toThrow(
      "Destructive migrations are blocked"
    );
    expect(() => checkDestructiveMigrations(tmpDir, true)).not.toThrow();

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("validates that DATABASE_MIGRATIONS.md contains all required operational commands and environment variables", () => {
    expect(() => validateDocCommands("DATABASE_MIGRATIONS.md")).not.toThrow();
  });

  it("fails validateDocCommands when mandatory operational commands are omitted from documentation", () => {
    const fs = require("fs");
    const path = require("path");
    const os = require("os");

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "doc-cmd-test-"));
    const docFile = path.join(tmpDir, "DATABASE_MIGRATIONS.md");

    // Documentation missing release:gate and check:migrations:drift
    fs.writeFileSync(
      docFile,
      "# Migrations\nRun `npm run check:migrations` and set `ALLOW_DESTRUCTIVE_MIGRATIONS=true`.\n"
    );

    expect(() => validateDocCommands(docFile)).toThrow(
      /Documentation completeness check failed/
    );
    expect(() => validateDocCommands(docFile)).toThrow(
      /schema drift verification/
    );
    expect(() => validateDocCommands(docFile)).toThrow(
      /pipeline release gate execution/
    );
    expect(() => validateDocCommands(docFile)).toThrow(
      /disposable migration replay/
    );

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
