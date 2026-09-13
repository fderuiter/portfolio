import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { MaintenanceService } from "@/lib/services/maintenance-service";
import { GET } from "@/app/api/cron/maintenance/route";

function adapters(
  overrides?: Partial<{
    syncTelemetry: () => Promise<Record<string, number | null>>;
    processEmailRetry: () => Promise<Record<string, number | null>>;
    runRetention: () => Promise<Record<string, number | null>>;
  }>
) {
  return {
    syncTelemetry:
      overrides?.syncTelemetry ||
      vi.fn().mockResolvedValue({ processed: 4, inserted: 4 }),
    processEmailRetry:
      overrides?.processEmailRetry ||
      vi.fn().mockResolvedValue({ processed: 1, succeeded: 1, failed: 0 }),
    runRetention:
      overrides?.runRetention ||
      vi.fn().mockResolvedValue({ rollupsUpserted: 2, rawEventsDeleted: 20 }),
  };
}

describe("unified maintenance pipeline (#714)", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("executes every phase sequentially and returns structured counts", async () => {
    const calls: string[] = [];
    const result = await MaintenanceService.run({
      now: new Date("2026-09-13T00:00:00.000Z"),
      adapters: adapters({
        syncTelemetry: vi.fn(async () => {
          calls.push("telemetry");
          return { processed: 4, inserted: 4 };
        }),
        processEmailRetry: vi.fn(async () => {
          calls.push("emailRetry");
          return { processed: 1, succeeded: 1, failed: 0 };
        }),
        runRetention: vi.fn(async () => {
          calls.push("retention");
          return { rollupsUpserted: 2, rawEventsDeleted: 20 };
        }),
      }),
    });

    expect(calls).toEqual(["telemetry", "emailRetry", "retention"]);
    expect(result.success).toBe(true);
    expect(result.partial).toBe(false);
    expect(result.deadlineMs).toBe(8000);
    expect(result.phases.telemetry.counts.processed).toBe(4);
    expect(result.phases.emailRetry.counts.succeeded).toBe(1);
    expect(result.phases.retention.counts.rawEventsDeleted).toBe(20);
  });

  it("isolates a failed phase and continues with later maintenance", async () => {
    const emailRetry = vi.fn().mockResolvedValue({ processed: 0 });
    const retention = vi.fn().mockResolvedValue({ rawEventsDeleted: 0 });
    const result = await MaintenanceService.run({
      adapters: adapters({
        syncTelemetry: vi.fn().mockRejectedValue(new Error("redis offline")),
        processEmailRetry: emailRetry,
        runRetention: retention,
      }),
    });

    expect(result.success).toBe(false);
    expect(result.partial).toBe(true);
    expect(result.phases.telemetry.status).toBe("failed");
    expect(result.phases.telemetry.error).toContain("redis offline");
    expect(emailRetry).toHaveBeenCalledOnce();
    expect(retention).toHaveBeenCalledOnce();
  });

  it("skips remaining work when the response reserve reaches the deadline", async () => {
    let currentTime = 1_000;
    const retention = vi.fn().mockResolvedValue({ rawEventsDeleted: 0 });
    const result = await MaintenanceService.run({
      deadlineMs: 500,
      clock: () => currentTime,
      adapters: adapters({
        syncTelemetry: vi.fn(async () => {
          currentTime += 260;
          return { processed: 1 };
        }),
        processEmailRetry: vi.fn(async () => {
          currentTime += 10;
          return { processed: 0 };
        }),
        runRetention: retention,
      }),
    });

    expect(result.durationMs).toBe(260);
    expect(result.phases.telemetry.status).toBe("completed");
    expect(result.phases.emailRetry.status).toBe("skipped");
    expect(result.phases.retention.status).toBe("skipped");
    expect(retention).not.toHaveBeenCalled();
  });

  it("rejects an unauthorized cron request before invoking the runner", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CRON_SECRET", "maintenance-secret");
    const run = vi.spyOn(MaintenanceService, "run");
    const response = await GET(
      new NextRequest("https://www.deruiter.dev/api/cron/maintenance")
    );

    expect(response.status).toBe(401);
    expect(run).not.toHaveBeenCalled();
  });

  it("runs an authenticated request with validated batch input", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CRON_SECRET", "maintenance-secret");
    const run = vi.spyOn(MaintenanceService, "run").mockResolvedValue({
      success: true,
      partial: false,
      startedAt: "2026-09-13T00:00:00.000Z",
      completedAt: "2026-09-13T00:00:00.100Z",
      durationMs: 100,
      deadlineMs: 8000,
      phases: {
        telemetry: { status: "completed", durationMs: 10, counts: {} },
        emailRetry: { status: "completed", durationMs: 10, counts: {} },
        retention: { status: "completed", durationMs: 10, counts: {} },
      },
    });
    const response = await GET(
      new NextRequest(
        "https://www.deruiter.dev/api/cron/maintenance?batch=25",
        { headers: { authorization: "Bearer maintenance-secret" } }
      )
    );

    expect(response.status).toBe(200);
    expect(run).toHaveBeenCalledWith({ batchSize: 25 });
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      partial: false,
      deadlineMs: 8000,
    });
  });
});
