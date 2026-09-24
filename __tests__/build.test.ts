/* eslint-disable */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import child_process from "child_process";

describe("build.js script execution", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let exitMock: any;
  let spawnSpy: any;

  beforeEach(() => {
    // Clear require cache for scripts/build.js so it executes on each require call
    delete require.cache[require.resolve("../scripts/build.js")];

    originalEnv = { ...process.env };
    exitMock = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`Process exited with code ${code}`);
    });
    spawnSpy = vi
      .spyOn(child_process, "spawnSync")
      .mockImplementation(() => ({ status: 0 }) as any);
  });

  afterEach(() => {
    process.env = originalEnv;
    exitMock.mockRestore();
    spawnSpy.mockRestore();
  });

  it("runs generate, check:migrations, and next build offline without prisma migrate deploy", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.DATABASE_URL = "postgresql://db:5432";

    try {
      require("../scripts/build.js");
    } catch (err: any) {
      expect(err.message).toBe("Process exited with code 0");
    }

    // It should have called prisma generate, check:migrations, and next build
    expect(spawnSpy).toHaveBeenCalledWith(
      "npx",
      ["prisma", "generate"],
      expect.any(Object)
    );
    expect(spawnSpy).toHaveBeenCalledWith(
      "npm",
      ["run", "check:migrations"],
      expect.any(Object)
    );
    expect(spawnSpy).toHaveBeenCalledWith(
      "npx",
      ["next", "build", "--webpack"],
      expect.any(Object)
    );

    // It MUST NOT execute live migration deploy
    expect(spawnSpy).not.toHaveBeenCalledWith(
      "npx",
      ["prisma", "migrate", "deploy"],
      expect.any(Object)
    );

    // It should exit with 0
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  it("never executes prisma migrate deploy off Vercel, even if VERCEL_ENV is production", () => {
    delete (process.env as any).VERCEL;
    process.env.VERCEL_ENV = "production";
    process.env.DATABASE_URL = "postgresql://db:5432";

    try {
      require("../scripts/build.js");
    } catch (err: any) {
      expect(err.message).toBe("Process exited with code 0");
    }

    // It should have called prisma generate, generate-openapi, check:migrations, and then next build
    expect(spawnSpy).toHaveBeenCalledWith(
      "npx",
      ["prisma", "generate"],
      expect.any(Object)
    );
    expect(spawnSpy).toHaveBeenCalledWith(
      "npx",
      ["tsx", "scripts/generate-openapi.ts"],
      expect.any(Object)
    );
    expect(spawnSpy).toHaveBeenCalledWith(
      "npm",
      ["run", "check:migrations"],
      expect.any(Object)
    );
    expect(spawnSpy).toHaveBeenCalledWith(
      "npx",
      ["next", "build", "--webpack"],
      expect.any(Object)
    );

    // It MUST NOT execute live migration deploy in static compilation
    expect(spawnSpy).not.toHaveBeenCalledWith(
      "npx",
      ["prisma", "migrate", "deploy"],
      expect.any(Object)
    );

    // Verify ordering: check:migrations happens BEFORE next build
    const calls = spawnSpy.mock.calls.map(
      (c: any[]) => `${c[0]} ${c[1].join(" ")}`
    );
    const checkMigrationsIndex = calls.findIndex((c: string) =>
      c.includes("check:migrations")
    );
    const nextBuildIndex = calls.findIndex((c: string) =>
      c.includes("next build")
    );

    expect(checkMigrationsIndex).toBeGreaterThan(-1);
    expect(nextBuildIndex).toBeGreaterThan(checkMigrationsIndex);

    // It should exit with 0
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  it("applies migrations on Vercel production builds, through the unpooled endpoint, before next build", () => {
    process.env.VERCEL = "1";
    process.env.VERCEL_ENV = "production";
    process.env.DATABASE_URL = "postgresql://pooled.example/db";
    process.env.DATABASE_URL_UNPOOLED = "postgresql://unpooled.example/db";

    try {
      require("../scripts/build.js");
    } catch (err: any) {
      expect(err.message).toBe("Process exited with code 0");
    }

    const calls = spawnSpy.mock.calls.map(
      (c: any[]) => `${c[0]} ${c[1].join(" ")}`
    );
    const migrateIndex = calls.indexOf("npx prisma migrate deploy");
    expect(migrateIndex).toBeGreaterThan(
      calls.indexOf("npm run check:migrations")
    );
    expect(calls.indexOf("npx next build --webpack")).toBeGreaterThan(
      migrateIndex
    );
    expect(spawnSpy.mock.calls[migrateIndex][2].env.DIRECT_URL).toBe(
      "postgresql://unpooled.example/db"
    );
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  it("does not migrate from a Vercel preview build", () => {
    process.env.VERCEL = "1";
    process.env.VERCEL_ENV = "preview";
    process.env.DATABASE_URL_UNPOOLED = "postgresql://unpooled.example/db";

    try {
      require("../scripts/build.js");
    } catch (err: any) {
      expect(err.message).toBe("Process exited with code 0");
    }

    expect(spawnSpy).not.toHaveBeenCalledWith(
      "npx",
      ["prisma", "migrate", "deploy"],
      expect.any(Object)
    );
  });

  it("fails a Vercel production build that has no unpooled endpoint", () => {
    process.env.VERCEL = "1";
    process.env.VERCEL_ENV = "production";
    delete (process.env as any).DATABASE_URL_UNPOOLED;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      require("../scripts/build.js");
    } catch (err: any) {
      expect(err.message).toBe("Process exited with code 1");
    }

    expect(exitMock).toHaveBeenCalledWith(1);
    expect(spawnSpy).not.toHaveBeenCalledWith(
      "npx",
      ["next", "build", "--webpack"],
      expect.any(Object)
    );
    errorSpy.mockRestore();
  });

  it("sets dummy DATABASE_URL and DIRECT_URL if none are provided", () => {
    process.env.VERCEL_ENV = "preview";
    delete (process.env as any).DATABASE_URL;
    delete (process.env as any).DIRECT_URL;

    try {
      require("../scripts/build.js");
    } catch (err: any) {
      expect(err.message).toBe("Process exited with code 0");
    }

    expect(process.env.DATABASE_URL).toBe(
      "postgresql://dummy:dummy@localhost:5432/dummy"
    );
    expect(process.env.DIRECT_URL).toBe(
      "postgresql://dummy:dummy@localhost:5432/dummy"
    );

    // Guard against credential leakage. scripts/build.js loads .env.local so a
    // local production build reaches the real database (issue #859), but it must
    // never do so under test: this assertion would otherwise print a live
    // connection string into the failure output.
    expect(process.env.DATABASE_URL).not.toContain("neon.tech");
    expect(process.env.DATABASE_URL).toContain("dummy");
  });

  it("fails immediately if a build step fails", () => {
    process.env.VERCEL_ENV = "preview";

    // Mock spawnSync to fail on prisma generate (the first call)
    spawnSpy.mockImplementationOnce(() => ({ status: 123 }) as any);

    try {
      require("../scripts/build.js");
    } catch (err: any) {
      expect(err.message).toBe("Process exited with code 123");
    }

    // It should have tried prisma generate
    expect(spawnSpy).toHaveBeenCalledWith(
      "npx",
      ["prisma", "generate"],
      expect.any(Object)
    );

    // It should NOT have tried next build
    expect(spawnSpy).not.toHaveBeenCalledWith(
      "npx",
      ["next", "build"],
      expect.any(Object)
    );

    // It should exit with the failed code (123)
    expect(exitMock).toHaveBeenCalledWith(123);
  });
});
