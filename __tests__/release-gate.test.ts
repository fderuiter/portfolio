/* eslint-disable */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import child_process from "child_process";
import * as checkMigrationsModule from "../scripts/check-migrations";
import { executeReleaseGate } from "../scripts/release-gate";

describe("release-gate.ts execution", () => {
  let exitSpy: any;
  let spawnSpy: any;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`Process exited with code ${code}`);
    });
    spawnSpy = vi.spyOn(child_process, "spawnSync").mockImplementation(() => ({ status: 0 } as any));
  });

  afterEach(() => {
    exitSpy.mockRestore();
    spawnSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("runs unified migration check and executes prisma migrate deploy when checks pass", () => {
    const validatorSpy = vi.spyOn(checkMigrationsModule, "runUnifiedMigrationCheck").mockImplementation(() => {});

    executeReleaseGate();

    expect(validatorSpy).toHaveBeenCalled();
    expect(spawnSpy).toHaveBeenCalledWith("npx", ["prisma", "migrate", "deploy"], expect.any(Object));
  });

  it("halts execution immediately when unified migration check fails", () => {
    vi.spyOn(checkMigrationsModule, "runUnifiedMigrationCheck").mockImplementation(() => {
      throw new Error("Destructive migrations are blocked");
    });

    expect(() => executeReleaseGate()).toThrow("Process exited with code 1");

    expect(spawnSpy).not.toHaveBeenCalledWith("npx", ["prisma", "migrate", "deploy"], expect.any(Object));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
