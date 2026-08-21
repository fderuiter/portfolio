import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockLpush, mockExpire, mockExec, mockLmove, mockLrange, mockDel, mockCreateMany } = vi.hoisted(() => {
  return {
    mockLpush: vi.fn(),
    mockExpire: vi.fn(),
    mockExec: vi.fn(),
    mockLmove: vi.fn(),
    mockLrange: vi.fn().mockResolvedValue([]),
    mockDel: vi.fn(),
    mockCreateMany: vi.fn().mockResolvedValue({ count: 1 }),
  };
});

vi.mock("@upstash/redis", () => {
  class MockRedis {
    pipeline() {
      return {
        lpush: mockLpush,
        expire: mockExpire,
        exec: mockExec,
        lmove: mockLmove,
        llen: vi.fn(),
      };
    }
    lrange = mockLrange;
    del = mockDel;
  }
  return { Redis: MockRedis };
});

vi.mock("@/lib/db", () => ({
  prisma: {
    telemetryEvent: {
      createMany: mockCreateMany,
    },
  },
}));

vi.mock("@upstash/ratelimit", () => {
  return {
    Ratelimit: class {
      static slidingWindow = vi.fn();
      limit = vi.fn().mockResolvedValue({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60000,
      });
    },
  };
});

import { TelemetryService } from "@/lib/services/telemetry-service";
import { GET as syncGET } from "@/app/api/telemetry/sync/route";

describe("Pre-Flight Queue Depth Guard for Telemetry Sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
  });

  it("Requirement 1 & 3: Immediately exits and returns success payload with zero processed items when both queues contain zero events", async () => {
    // Pre-flight returns 0 for both telemetry_buffer and telemetry_processing
    mockExec.mockResolvedValueOnce([0, 0]);

    const req = new NextRequest("http://localhost:3000/api/telemetry/sync", {
      headers: { authorization: "Bearer test-secret" },
    });

    const res = await syncGET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual({ success: true, processed: 0 });

    // Zero state-mutating cache operations executed during idle cycle
    expect(mockLmove).not.toHaveBeenCalled();
    expect(mockDel).not.toHaveBeenCalled();
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("Requirement 2: Pre-flight inspection checks both primary buffer queue and recovery staging queue", async () => {
    const depthsSpy = vi.spyOn(TelemetryService, "getQueueDepths");
    mockExec.mockResolvedValueOnce([0, 0]);

    const req = new NextRequest("http://localhost:3000/api/telemetry/sync", {
      headers: { authorization: "Bearer test-secret" },
    });

    await syncGET(req);

    expect(depthsSpy).toHaveBeenCalled();
    const depths = await depthsSpy.mock.results[0].value;
    expect(depths).toEqual({ bufferLength: 0, processingLength: 0 });
  });

  it("Requirement 4: Proceeds with standard double-buffered ingestion when primary buffer queue has pending items", async () => {
    // Pre-flight check finds 2 items in buffer, 0 in processing
    mockExec.mockResolvedValueOnce([2, 0]);

    const mockEvents = [
      { id: "evt-1", projectSlug: "proj-1", eventType: "page_view", createdAt: new Date() },
      { id: "evt-2", projectSlug: "proj-2", eventType: "project_click", createdAt: new Date() },
    ];

    mockLrange.mockResolvedValueOnce([]); // no existing processing
    mockExec.mockResolvedValueOnce(mockEvents); // lmove batch result
    mockCreateMany.mockResolvedValueOnce({ count: 2 });

    const req = new NextRequest("http://localhost:3000/api/telemetry/sync", {
      headers: { authorization: "Bearer test-secret" },
    });

    const res = await syncGET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.processed).toBe(2);
    expect(json.inserted).toBe(2);

    expect(mockLmove).toHaveBeenCalledWith("telemetry_buffer", "telemetry_processing", "right", "left");
    expect(mockCreateMany).toHaveBeenCalledTimes(1);
    expect(mockDel).toHaveBeenCalledWith("telemetry_processing");
  });

  it("Requirement 4: Proceeds with standard double-buffered ingestion when recovery staging queue has pending items", async () => {
    // Pre-flight check finds 0 items in buffer, 3 items in recovery staging queue
    mockExec.mockResolvedValueOnce([0, 3]);

    const pendingStagingEvents = [
      { id: "stg-1", projectSlug: "proj-stg", eventType: "page_view", createdAt: new Date() },
      { id: "stg-2", projectSlug: "proj-stg", eventType: "project_click", createdAt: new Date() },
      { id: "stg-3", projectSlug: "proj-stg", eventType: "page_view", createdAt: new Date() },
    ];

    mockLrange.mockResolvedValueOnce(pendingStagingEvents);
    mockCreateMany.mockResolvedValueOnce({ count: 3 });

    const req = new NextRequest("http://localhost:3000/api/telemetry/sync", {
      headers: { authorization: "Bearer test-secret" },
    });

    const res = await syncGET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.processed).toBe(3);
    expect(json.inserted).toBe(3);

    expect(mockCreateMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ id: "stg-1" }),
        expect.objectContaining({ id: "stg-2" }),
        expect.objectContaining({ id: "stg-3" }),
      ]),
      skipDuplicates: true,
    });
    expect(mockDel).toHaveBeenCalledWith("telemetry_processing");
  });

  it("Guardrail: Pre-flight check does not modify, lock, or clear queued telemetry items", async () => {
    mockExec.mockResolvedValueOnce([5, 2]);

    const depths = await TelemetryService.getQueueDepths();
    expect(depths).toEqual({ bufferLength: 5, processingLength: 2 });

    // Confirm no mutating calls were dispatched during getQueueDepths
    expect(mockLmove).not.toHaveBeenCalled();
    expect(mockDel).not.toHaveBeenCalled();
  });
});
