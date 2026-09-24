import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StructuredLogger, logger } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

describe("StructuredLogger", () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exports a default singleton logger instance", () => {
    expect(logger).toBeInstanceOf(StructuredLogger);
  });

  it("logs info messages with structured metadata to console and Sentry breadcrumbs", () => {
    const testLogger = new StructuredLogger();
    const entry = testLogger.info("System initialized", { module: "auth" });

    expect(entry.level).toBe("info");
    expect(entry.message).toBe("System initialized");
    expect(entry.meta).toEqual({ module: "auth" });
    expect(consoleInfoSpy).toHaveBeenCalledWith("System initialized", {
      module: "auth",
    });
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "logger",
      message: "System initialized",
      level: "info",
      data: { module: "auth" },
    });
  });

  it("logs debug messages to console.debug", () => {
    const testLogger = new StructuredLogger();
    const entry = testLogger.debug("Cache miss", { key: "user_1" });

    expect(entry.level).toBe("debug");
    expect(entry.message).toBe("Cache miss");
    expect(consoleDebugSpy).toHaveBeenCalledWith("Cache miss", {
      key: "user_1",
    });
  });

  it("logs warning messages with errors or metadata", () => {
    const testLogger = new StructuredLogger();
    const testErr = new Error("Quota near limit");
    const entry = testLogger.warn("Rate limit approaching", testErr, {
      threshold: 90,
    });

    expect(entry.level).toBe("warn");
    expect(entry.message).toBe("Rate limit approaching");
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(testErr, {
      level: "warning",
      extra: { message: "Rate limit approaching", threshold: 90 },
    });
  });

  it("logs error messages and captures exception in Sentry", () => {
    const testLogger = new StructuredLogger();
    const testErr = new Error("Database connection failed");
    const entry = testLogger.error("Failed DB write", testErr, {
      route: "/api/contact",
    });

    expect(entry.level).toBe("error");
    expect(entry.message).toBe("Failed DB write");
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error), {
      extra: { message: "Failed DB write", route: "/api/contact" },
    });
  });

  it("captures Sentry message when error method is called without an Error instance", () => {
    const testLogger = new StructuredLogger();
    testLogger.error("Unhandled state");

    expect(Sentry.captureMessage).toHaveBeenCalledWith("Unhandled state", {
      level: "error",
      extra: undefined,
    });
  });

  it("respects silent option by omitting console output", () => {
    const testLogger = new StructuredLogger({ silent: true });
    testLogger.info("Silent log");

    expect(consoleInfoSpy).not.toHaveBeenCalled();
  });

  it("respects enableTelemetry: false by omitting Sentry calls", () => {
    const testLogger = new StructuredLogger({ enableTelemetry: false });
    testLogger.error("Local error", new Error("Local test"));

    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
