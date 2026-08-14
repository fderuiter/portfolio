/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, expect, it } from "vitest";

// The production guard is CommonJS because it runs directly under Node.
const {
  getLockProvider,
  getSchemaProvider,
  validateMigrationFiles,
} = require("../scripts/check-migration-integrity.js");

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
    ]);
  });

  it("rejects a datasource with no literal provider", () => {
    expect(() => getSchemaProvider("datasource db { url = env(\"DATABASE_URL\") }")).toThrow(
      "Could not read the datasource provider",
    );
  });
});
