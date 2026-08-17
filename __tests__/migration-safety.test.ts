/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, expect, it } from "vitest";

const {
  tokenize,
  splitStatements,
  analyzeStatement,
  getTableName,
  getColumnName,
} = require("../scripts/check-migrations.js");

describe("Token-Based SQL Analyzer - Migration Safety", () => {
  it("tokenizes SQL strings, stripping comments and normalizing keywords to uppercase", () => {
    const sql = `
      -- This is a line comment
      ALTER TABLE "User" RENAME /* block comment */ COLUMN "oldCol" TO "newCol";
    `;
    const tokens = tokenize(sql);
    expect(tokens.map((t: { value: string }) => t.value)).toEqual([
      "ALTER",
      "TABLE",
      '"User"',
      "RENAME",
      "COLUMN",
      '"oldCol"',
      "TO",
      '"newCol"',
      ";",
    ]);
  });

  it("handles case variations and complex formatting", () => {
    const sql = "alTeR tAbLe \"User\" ReNaMe CoLuMn \"oldCol\" To \"newCol\";";
    const tokens = tokenize(sql);
    expect(tokens.map((t: { value: string }) => t.value)).toEqual([
      "ALTER",
      "TABLE",
      '"User"',
      "RENAME",
      "COLUMN",
      '"oldCol"',
      "TO",
      '"newCol"',
      ";",
    ]);
  });

  it("flags destructive RENAME COLUMN operations", () => {
    const sql = `ALTER TABLE "User" RENAME COLUMN "oldCol" TO "newCol";`;
    const tokens = tokenize(sql);
    const statements = splitStatements(tokens);
    const result = analyzeStatement(statements[0]);
    expect(result.unsafe).toBe(true);
    expect(result.reason).toBe("RENAME COLUMN");
    expect(getTableName(statements[0])).toBe('"User"');
    expect(getColumnName(statements[0], result.reason)).toBe('"oldCol"');
  });

  it("flags destructive RENAME TO operations", () => {
    const sql = `ALTER TABLE "User" RENAME TO "NewUser";`;
    const tokens = tokenize(sql);
    const statements = splitStatements(tokens);
    const result = analyzeStatement(statements[0]);
    expect(result.unsafe).toBe(true);
    expect(result.reason).toBe("RENAME TO");
    expect(getTableName(statements[0])).toBe('"User"');
    expect(getColumnName(statements[0], result.reason)).toBe("N/A");
  });

  it("flags destructive ALTER COLUMN TYPE operations (with COLUMN)", () => {
    const sql = `ALTER TABLE "User" ALTER COLUMN "email" TYPE VARCHAR(255);`;
    const tokens = tokenize(sql);
    const statements = splitStatements(tokens);
    const result = analyzeStatement(statements[0]);
    expect(result.unsafe).toBe(true);
    expect(result.reason).toBe("ALTER COLUMN TYPE");
    expect(getTableName(statements[0])).toBe('"User"');
    expect(getColumnName(statements[0], result.reason)).toBe('"email"');
  });

  it("flags destructive ALTER COLUMN SET DATA TYPE operations", () => {
    const sql = `ALTER TABLE "User" ALTER COLUMN "email" SET DATA TYPE TEXT;`;
    const tokens = tokenize(sql);
    const statements = splitStatements(tokens);
    const result = analyzeStatement(statements[0]);
    expect(result.unsafe).toBe(true);
    expect(result.reason).toBe("ALTER COLUMN TYPE");
    expect(getTableName(statements[0])).toBe('"User"');
    expect(getColumnName(statements[0], result.reason)).toBe('"email"');
  });

  it("flags destructive ALTER COLUMN TYPE operations when COLUMN keyword is omitted", () => {
    const sql = `ALTER TABLE "User" ALTER "email" TYPE TEXT;`;
    const tokens = tokenize(sql);
    const statements = splitStatements(tokens);
    const result = analyzeStatement(statements[0]);
    expect(result.unsafe).toBe(true);
    expect(result.reason).toBe("ALTER COLUMN TYPE");
    expect(getTableName(statements[0])).toBe('"User"');
    expect(getColumnName(statements[0], result.reason)).toBe('"email"');
  });

  it("flags destructive SET NOT NULL operations", () => {
    const sql = `ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;`;
    const tokens = tokenize(sql);
    const statements = splitStatements(tokens);
    const result = analyzeStatement(statements[0]);
    expect(result.unsafe).toBe(true);
    expect(result.reason).toBe("SET NOT NULL");
    expect(getTableName(statements[0])).toBe('"User"');
    expect(getColumnName(statements[0], result.reason)).toBe('"email"');
  });

  it("flags destructive DROP COLUMN operations", () => {
    const sql = `ALTER TABLE "User" DROP COLUMN "email";`;
    const tokens = tokenize(sql);
    const statements = splitStatements(tokens);
    const result = analyzeStatement(statements[0]);
    expect(result.unsafe).toBe(true);
    expect(result.reason).toBe("DROP COLUMN");
    expect(getTableName(statements[0])).toBe('"User"');
    expect(getColumnName(statements[0], result.reason)).toBe('"email"');
  });

  it("flags destructive DROP TABLE operations", () => {
    const sql = `DROP TABLE "User";`;
    const tokens = tokenize(sql);
    const statements = splitStatements(tokens);
    const result = analyzeStatement(statements[0]);
    expect(result.unsafe).toBe(true);
    expect(result.reason).toBe("DROP TABLE");
  });

  it("allows safe migrations like adding new nullable or default columns", () => {
    const sql = `
      ALTER TABLE "User" ADD COLUMN "new_col" TEXT;
      ALTER TABLE "User" ADD COLUMN "another_col" INTEGER DEFAULT 0;
    `;
    const tokens = tokenize(sql);
    const statements = splitStatements(tokens);
    for (const statement of statements) {
      const result = analyzeStatement(statement);
      expect(result.unsafe).toBe(false);
    }
  });

  it("does not false-positive on safe columns named 'type', 'not_null', or similar", () => {
    const sql = `
      ALTER TABLE "User" ADD COLUMN "type" TEXT;
      ALTER TABLE "User" ADD COLUMN type TEXT;
      ALTER TABLE "User" ADD COLUMN "not_null" TEXT;
    `;
    const tokens = tokenize(sql);
    const statements = splitStatements(tokens);
    for (const statement of statements) {
      const result = analyzeStatement(statement);
      expect(result.unsafe).toBe(false);
    }
  });

  it("fails when a destructive command is disguised with inline comments", () => {
    const sql = "ALTER TABLE \"User\" RENAME /* nested comment */ COLUMN \"oldCol\" TO \"newCol\";";
    const tokens = tokenize(sql);
    const statements = splitStatements(tokens);
    const result = analyzeStatement(statements[0]);
    expect(result.unsafe).toBe(true);
    expect(result.reason).toBe("RENAME COLUMN");
  });
});
