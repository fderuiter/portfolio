import { describe, expect, it } from "vitest";
import {
  redactDatabaseUrl,
  isTargetDisposable,
  resolveReplayTarget,
  runMigrationReplay,
} from "../scripts/migration-replay";

describe("Migration Replay: URL Redaction & Target Disposability", () => {
  it("redacts credentials from PostgreSQL URLs while preserving host, database, and schema", () => {
    const raw =
      "postgresql://myuser:supersecretpass@localhost:5432/portfolio_ci?schema=replay_test";
    const redacted = redactDatabaseUrl(raw);

    expect(redacted).not.toContain("myuser");
    expect(redacted).not.toContain("supersecretpass");
    expect(redacted).toContain("localhost:5432");
    expect(redacted).toContain("/portfolio_ci");
    expect(redacted).toContain("schema=replay_test");
    expect(redacted).toBe(
      "postgresql://***:***@localhost:5432/portfolio_ci?schema=replay_test"
    );
  });

  it("redacts credentials when special characters exist in password", () => {
    const raw =
      "postgres://admin:p%40ss%3Aword!@ep-cool-lake-123456.us-east-2.aws.neon.tech/neondb?sslmode=require";
    const redacted = redactDatabaseUrl(raw);

    expect(redacted).not.toContain("admin");
    expect(redacted).not.toContain("p%40ss%3Aword!");
    expect(redacted).toContain("ep-cool-lake-123456.us-east-2.aws.neon.tech");
    expect(redacted).toContain("/neondb");
    expect(redacted).toBe(
      "postgres://***:***@ep-cool-lake-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
    );
  });

  it("identifies localhost and CI test targets as disposable", () => {
    const localhostTarget =
      "postgresql://postgres:postgres@localhost:5432/portfolio_ci?schema=replay";
    const result = isTargetDisposable(localhostTarget);
    expect(result.disposable).toBe(true);
  });

  it("refuses cloud database targets (like Neon) unless explicit authorization flag is set", () => {
    const neonTarget =
      "postgresql://user:pass@ep-cool-pooler.us-east-2.aws.neon.tech/portfolio_prod";

    const refused = isTargetDisposable(neonTarget);
    expect(refused.disposable).toBe(false);
    expect(refused.reason).toMatch(/non-disposable cloud target/i);

    const authorized = isTargetDisposable(neonTarget, {
      allowNonDisposable: true,
    });
    expect(authorized.disposable).toBe(true);
    expect(authorized.overridden).toBe(true);
  });

  it("refuses targets with production keywords in database name", () => {
    const prodTarget =
      "postgresql://postgres:postgres@localhost:5432/portfolio_production";
    const result = isTargetDisposable(prodTarget);
    expect(result.disposable).toBe(false);
    expect(result.reason).toMatch(/production/i);
  });
});

describe("Migration Replay: Target Resolution & Ambient Env Isolation", () => {
  it("does NOT fall back to ambient DIRECT_URL or DATABASE_URL if no explicit target is supplied", () => {
    const originalEnv = { ...process.env };
    try {
      process.env["DIRECT_URL"] =
        "postgresql://admin:secret@ep-live.neon.tech/portfolio";
      process.env["DATABASE_URL"] =
        "postgresql://admin:secret@ep-pooler.neon.tech/portfolio";
      delete process.env["MIGRATION_REPLAY_URL"];
      delete process.env["DISPOSABLE_DATABASE_URL"];

      // Explicitly check without docker
      const resolved = resolveReplayTarget({ checkDocker: false });
      expect(resolved.type).toBe("unavailable");
      expect(resolved.url).toBeUndefined();
      expect(resolved.isDisposable).toBe(false);
      expect(resolved.reason).toMatch(
        /no explicit disposable target was provided/i
      );
    } finally {
      process.env = originalEnv;
    }
  });

  it("prefers MIGRATION_REPLAY_URL over ambient environment variables", () => {
    const originalEnv = { ...process.env };
    try {
      process.env["DIRECT_URL"] =
        "postgresql://admin:secret@ep-live.neon.tech/portfolio";
      process.env["MIGRATION_REPLAY_URL"] =
        "postgresql://postgres:postgres@localhost:5432/portfolio_ci?schema=replay";

      const resolved = resolveReplayTarget({ checkDocker: false });
      expect(resolved.type).toBe("explicit");
      expect(resolved.url).toBe(
        "postgresql://postgres:postgres@localhost:5432/portfolio_ci?schema=replay"
      );
      expect(resolved.redactedTarget).toBe(
        "postgresql://***:***@localhost:5432/portfolio_ci?schema=replay"
      );
      expect(resolved.isDisposable).toBe(true);
    } finally {
      process.env = originalEnv;
    }
  });

  it("refuses non-disposable explicit target with actionable error message", async () => {
    await expect(
      runMigrationReplay({
        targetUrl: "postgresql://admin:secret@ep-prod.neon.tech/neondb",
        allowNonDisposable: false,
      })
    ).rejects.toThrow(/Refusing non-disposable target/);
  });

  it("rejects execution when target is completely unavailable and explains operator remediation", async () => {
    await expect(
      runMigrationReplay({
        checkDocker: false,
      })
    ).rejects.toThrow(/No disposable PostgreSQL target available/);
  });

  it("appends isolated schema to connection url when requested", async () => {
    let capturedUrl: string | undefined;
    await runMigrationReplay({
      targetUrl: "postgresql://postgres:postgres@localhost:5432/portfolio_ci",
      isolatedSchema: "ephemeral_replay_test",
      quiet: true,
      executor: (cmd, args, opts) => {
        if (opts?.env?.DATABASE_URL) {
          capturedUrl = opts.env.DATABASE_URL;
        }
        return { status: 0, stdout: "", stderr: "" };
      },
    });

    expect(capturedUrl).toContain("schema=ephemeral_replay_test");
  });

  it("completes replay workflow and verifies zero schema drift on valid target", async () => {
    const executedCommands: string[] = [];
    const result = await runMigrationReplay({
      targetUrl:
        "postgresql://postgres:postgres@localhost:5432/portfolio_ci?schema=replay",
      quiet: true,
      executor: (cmd, args) => {
        executedCommands.push(`${cmd} ${args.join(" ")}`);
        if (args.includes("status")) {
          return {
            status: 0,
            stdout: "20260417215437_init\n20260528000000_add_telemetry_event\n",
            stderr: "",
          };
        }
        return { status: 0, stdout: "", stderr: "" };
      },
    });

    expect(result.success).toBe(true);
    expect(result.schemaDrift).toBe(false);
    expect(result.targetRedacted).toBe(
      "postgresql://***:***@localhost:5432/portfolio_ci?schema=replay"
    );
    expect(result.appliedMigrations).toContain("20260417215437_init");
    expect(
      executedCommands.some((c) => c.includes("prisma migrate deploy"))
    ).toBe(true);
    expect(
      executedCommands.some((c) => c.includes("prisma migrate diff"))
    ).toBe(true);
  });

  it("throws diagnostic error when migration deploy fails", async () => {
    await expect(
      runMigrationReplay({
        targetUrl:
          "postgresql://postgres:postgres@localhost:5432/portfolio_ci?schema=replay",
        quiet: true,
        executor: (cmd, args) => {
          if (args.includes("deploy")) {
            return {
              status: 1,
              stdout: "",
              stderr:
                "P3009: Migrate found failed migrations in the target database",
            };
          }
          return { status: 0, stdout: "", stderr: "" };
        },
      })
    ).rejects.toThrow(/Migration replay failed while applying migrations/);
  });

  it("throws diagnostic error when schema drift is detected", async () => {
    await expect(
      runMigrationReplay({
        targetUrl:
          "postgresql://postgres:postgres@localhost:5432/portfolio_ci?schema=replay",
        quiet: true,
        executor: (cmd, args) => {
          if (args.includes("diff")) {
            return {
              status: 1,
              stdout: "Added table: UnexpectedTable\n",
              stderr: "",
            };
          }
          return { status: 0, stdout: "", stderr: "" };
        },
      })
    ).rejects.toThrow(/residual schema drift/);
  });
});
