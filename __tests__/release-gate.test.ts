/* eslint-disable */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import child_process from "child_process";
import * as checkMigrationsModule from "../scripts/check-migrations";
import * as securityAuditModule from "../scripts/security-audit";
import {
  executeReleaseGate,
  validateEmailCredentials,
} from "../scripts/release-gate";

describe("release-gate.ts execution", () => {
  let exitSpy: any;
  let spawnSpy: any;
  let origResendKey: string | undefined;

  beforeEach(() => {
    origResendKey = process.env.RESEND_API_KEY;
    process.env.RESEND_API_KEY = "re_test_mock_key";
    exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`Process exited with code ${code}`);
    });
    spawnSpy = vi
      .spyOn(child_process, "spawnSync")
      .mockImplementation(() => ({ status: 0 }) as any);
  });

  afterEach(() => {
    if (origResendKey !== undefined) {
      process.env.RESEND_API_KEY = origResendKey;
    } else {
      delete process.env.RESEND_API_KEY;
    }
    exitSpy.mockRestore();
    spawnSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("halts execution immediately when production email credentials are missing", () => {
    delete process.env.RESEND_API_KEY;
    const auditSpy = vi.spyOn(securityAuditModule, "runSecurityAudit");
    const validatorSpy = vi.spyOn(
      checkMigrationsModule,
      "runUnifiedMigrationCheck"
    );

    expect(() => validateEmailCredentials()).toThrow(
      "Missing required production messaging credentials"
    );
    expect(() => executeReleaseGate()).toThrow("Process exited with code 1");

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(auditSpy).not.toHaveBeenCalled();
    expect(validatorSpy).not.toHaveBeenCalled();
    expect(spawnSpy).not.toHaveBeenCalled();
  });

  it("runs vulnerability audit before migration check and executes prisma migrate deploy when checks pass", () => {
    const auditSpy = vi
      .spyOn(securityAuditModule, "runSecurityAudit")
      .mockImplementation(() => true);
    const validatorSpy = vi
      .spyOn(checkMigrationsModule, "runUnifiedMigrationCheck")
      .mockImplementation(() => {});

    executeReleaseGate();

    expect(auditSpy).toHaveBeenCalledWith({ throwOnError: true });
    expect(validatorSpy).toHaveBeenCalled();
    expect(spawnSpy).toHaveBeenCalledWith(
      "npx",
      ["prisma", "migrate", "deploy"],
      expect.any(Object)
    );

    const auditCallOrder = auditSpy.mock.invocationCallOrder[0];
    const validatorCallOrder = validatorSpy.mock.invocationCallOrder[0];
    expect(auditCallOrder).toBeLessThan(validatorCallOrder);
  });

  it("halts execution immediately when vulnerability security audit fails (before migration checks)", () => {
    const auditSpy = vi
      .spyOn(securityAuditModule, "runSecurityAudit")
      .mockImplementation(() => {
        throw new Error("Critical vulnerability detected");
      });
    const validatorSpy = vi
      .spyOn(checkMigrationsModule, "runUnifiedMigrationCheck")
      .mockImplementation(() => {});

    expect(() => executeReleaseGate()).toThrow("Process exited with code 1");

    expect(auditSpy).toHaveBeenCalledWith({ throwOnError: true });
    expect(validatorSpy).not.toHaveBeenCalled();
    expect(spawnSpy).not.toHaveBeenCalledWith(
      "npx",
      ["prisma", "migrate", "deploy"],
      expect.any(Object)
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("halts execution immediately when unified migration check fails", () => {
    vi.spyOn(securityAuditModule, "runSecurityAudit").mockImplementation(
      () => true
    );
    vi.spyOn(
      checkMigrationsModule,
      "runUnifiedMigrationCheck"
    ).mockImplementation(() => {
      throw new Error("Destructive migrations are blocked");
    });

    expect(() => executeReleaseGate()).toThrow("Process exited with code 1");

    expect(spawnSpy).not.toHaveBeenCalledWith(
      "npx",
      ["prisma", "migrate", "deploy"],
      expect.any(Object)
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
