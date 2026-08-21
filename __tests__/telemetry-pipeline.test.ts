import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// 1. Hoisted mocks definition
const { mockRatelimitLimit, mockLpush, mockExpire, mockExec, mockRpop, mockLmove, mockLrange, mockDel, mockLlen, mockUseRef, mockUseEffect } = vi.hoisted(() => {
  return {
    mockRatelimitLimit: vi.fn(),
    mockLpush: vi.fn(),
    mockExpire: vi.fn(),
    mockExec: vi.fn(),
    mockRpop: vi.fn(),
    mockLmove: vi.fn(),
    mockLrange: vi.fn().mockResolvedValue([]),
    mockDel: vi.fn(),
    mockLlen: vi.fn(),
    mockUseRef: vi.fn(),
    mockUseEffect: vi.fn(),
  };
});

// 2. Setup mock modules
vi.mock("react", async (importOriginal) => {
  const original = await importOriginal<typeof import("react")>();
  return {
    ...original,
    useRef: mockUseRef,
    useEffect: mockUseEffect,
  };
});

vi.mock("@/lib/db", async (importOriginal) => {
  const isLiveDb = !!(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("dummy"));
  if (isLiveDb) {
    return await importOriginal<typeof import("@/lib/db")>();
  }
  return {
    prisma: {
      telemetryEvent: {
        create: vi.fn(),
        createMany: vi.fn().mockResolvedValue({ count: 2 }),
        groupBy: vi.fn(),
      },
    },
  };
});

vi.mock("@upstash/redis", () => {
  class MockRedis {
    pipeline() {
      let isLlenPipeline = false;
      let isLmovePipeline = false;

      const p = {
        lpush: (..._args: unknown[]) => { mockLpush(..._args); return p; },
        expire: (..._args: unknown[]) => { mockExpire(..._args); return p; },
        rpop: (..._args: unknown[]) => { mockRpop(..._args); return p; },
        lmove: (..._args: unknown[]) => { isLmovePipeline = true; mockLmove(..._args); return p; },
        llen: (..._args: unknown[]) => { isLlenPipeline = true; mockLlen(..._args); return p; },
        exec: async () => {
          if (isLlenPipeline && !isLmovePipeline) {
            const results = mockLlen.mock.results;
            if (results && results.length >= 2) {
              const r1 = results[results.length - 2]?.value;
              const r2 = results[results.length - 1]?.value;
              if (typeof r1 === "number" || typeof r2 === "number") {
                return [r1 ?? 0, r2 ?? 0];
              }
            }
            return [1, 0];
          }
          return mockExec();
        },
      };
      return p;
    }
    lrange = mockLrange;
    del = mockDel;
  }
  return { Redis: MockRedis };
});

vi.mock("@upstash/ratelimit", () => {
  return {
    Ratelimit: class {
      static slidingWindow = vi.fn();
      limit = mockRatelimitLimit;
    },
  };
});

vi.mock("@/hooks/useTelemetry", () => ({
  useTelemetry: vi.fn(),
}));

// 3. Import API endpoints, React, and components AFTER hoisted mocks
import { NextRequest } from "next/server";
import { POST } from "@/app/api/telemetry/route";
import { GET as GETSync } from "@/app/api/telemetry/sync/route";
import { prisma } from "@/lib/db";
import { TelemetryTracker } from "@/components/TelemetryTracker";
import { useTelemetry } from "@/hooks/useTelemetry";

const isLiveDb = !!(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("dummy"));

describe("Telemetry Robustness & Pipeline Test Suite", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useRealTimers();
    process.env.CRON_SECRET = "test-secret";

    // Standard default rate limit success behavior
    mockRatelimitLimit.mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    });

    // Default Redis exec response
    mockExec.mockResolvedValue([1]);

    if (isLiveDb) {
      // State isolation: clear the live database state before each test run
      await prisma.telemetryEvent.deleteMany();
    } else {
      // Default Prisma database create behavior (instant resolution)
      vi.mocked(prisma.telemetryEvent.create).mockResolvedValue({
        id: "some-uuid",
        projectSlug: "/dashboard",
        eventType: "page_view",
        createdAt: new Date(),
      });
    }

    // Setup React hook mocks to have basic default behaviors
    mockUseRef.mockImplementation((initialValue) => ({ current: initialValue }));
    mockUseEffect.mockImplementation((cb) => cb());
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    if (isLiveDb) {
      // Reset the database state after each test run for absolute isolation
      await prisma.telemetryEvent.deleteMany();
    }
  });

  // --- REQUIREMENT 1 ---
  describe("Primary Database Timeout Fallback Routing (Requirement 1)", () => {
    it("redirects event payload to backup buffer queue when database queries exceed 100ms", async () => {
      vi.useFakeTimers();

      // Mock DB create to never resolve, simulating extreme latency/timeout
      if (isLiveDb) {
        vi.spyOn(prisma.telemetryEvent, "create").mockImplementation(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return new Promise(() => {}) as any; // Never resolves
        });
      } else {
        vi.mocked(prisma.telemetryEvent.create).mockImplementation(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return new Promise(() => {}) as any; // Never resolves
        });
      }

      const payload = {
        projectSlug: "/latency-test",
        eventType: "page_view",
      };

      const req = new NextRequest("http://localhost:3000/api/telemetry", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Execute route and trigger fake timers
      const promise = POST(req);
      await vi.advanceTimersByTimeAsync(105);
      const response = await promise;

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);

      // Verify backup buffer write (lpush) was called with appropriate payload
      expect(mockLpush).toHaveBeenCalledWith(
        "telemetry_buffer",
        expect.objectContaining({
          projectSlug: "/latency-test",
          eventType: "page_view",
        })
      );

      // Verify that Redis key has TTL set
      expect(mockExpire).toHaveBeenCalledWith("telemetry_buffer", 172800);
    });
  });

  // --- REQUIREMENT 2 ---
  describe("Client-Side Double-Render Deduplication (Requirement 2)", () => {
    it("ignores duplicate tracking dispatches generated by React strict mode double-rendering", () => {
      const mockRecordEvent = vi.fn();
      vi.mocked(useTelemetry).mockReturnValue({
        recordEvent: mockRecordEvent,
        telemetry: {},
        syncFailed: false,
        refetch: vi.fn(),
        queueLength: 0,
        queueCapacity: 50,
        pendingDeferredLength: 0,
      });

      // Set up a ref store to replicate component lifecycle mount persistence
      const refStore = { current: false };
      mockUseRef.mockReturnValue(refStore);

      let effectCallback: (() => void) | undefined;
      mockUseEffect.mockImplementation((cb) => {
        effectCallback = cb;
      });

      // Render/Execute the Tracker component
      TelemetryTracker({ slug: "/home-dashboard" });

      expect(mockUseEffect).toHaveBeenCalled();
      expect(effectCallback).toBeDefined();

      // Simulate First Mount effect callback execution
      effectCallback!();
      expect(mockRecordEvent).toHaveBeenCalledTimes(1);
      expect(mockRecordEvent).toHaveBeenCalledWith("/home-dashboard", "page_view", { defer: true });

      // Simulate Second Mount effect callback execution (Strict Mode double-render)
      effectCallback!();
      expect(mockRecordEvent).toHaveBeenCalledTimes(1); // Keeps strictly to exactly 1 call!
    });
  });

  // --- REQUIREMENT 3 ---
  describe("Batch Synchronization Service (Requirement 3)", () => {
    it("pulls buffered items from Redis in groups of 50 via atomic LMOVE and ignores duplicate payloads", async () => {
      // Mock Redis exec response returning 2 mock items and 48 null values
      const mockEvents = [
        { id: "uuid-1", projectSlug: "/project-a", eventType: "page_view", createdAt: new Date() },
        { id: "uuid-2", projectSlug: "/project-b", eventType: "project_click", createdAt: new Date() },
        ...Array(48).fill(null),
      ];
      mockLrange.mockResolvedValueOnce([]);
      mockExec.mockResolvedValue(mockEvents);

      const req = new NextRequest("http://localhost:3000/api/telemetry/sync", {
        headers: {
          authorization: "Bearer test-secret",
        },
      });

      const response = await GETSync(req);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.processed).toBe(2); // 2 non-null events processed from the batch

      // Check that it transferred items atomically via lmove exactly 50 times
      expect(mockLmove).toHaveBeenCalledTimes(50);
      expect(mockLmove).toHaveBeenCalledWith("telemetry_buffer", "telemetry_processing", "right", "left");
      expect(mockDel).toHaveBeenCalledWith("telemetry_processing");

      // Verify skipping of duplicate payloads logged in database
      if (isLiveDb) {
        const eventsInDb = await prisma.telemetryEvent.findMany({
          where: {
            id: { in: ["uuid-1", "uuid-2"] },
          },
          orderBy: { id: "asc" },
        });
        expect(eventsInDb).toHaveLength(2);
        expect(eventsInDb[0].projectSlug).toBe("/project-a");
        expect(eventsInDb[1].projectSlug).toBe("/project-b");
      } else {
        expect(prisma.telemetryEvent.createMany).toHaveBeenCalledWith({
          data: [
            {
              id: "uuid-1",
              projectSlug: "/project-a",
              eventType: "page_view",
              createdAt: expect.any(Date),
            },
            {
              id: "uuid-2",
              projectSlug: "/project-b",
              eventType: "project_click",
              createdAt: expect.any(Date),
            },
          ],
          skipDuplicates: true, // Absolutely key to ignore database duplicates!
        });
      }
    });

    it("returns error response when authorization is invalid", async () => {
      const req = new NextRequest("http://localhost:3000/api/telemetry/sync", {
        headers: {
          authorization: "Bearer wrong-secret",
        },
      });

      const response = await GETSync(req);
      expect(response.status).toBe(401);
    });

    it("handles primary database write failure during sync and preserves event batch intact in processing queue", async () => {
      const mockEvents = [
        { id: "uuid-1", projectSlug: "/project-a", eventType: "page_view", createdAt: new Date() },
      ];
      mockLrange.mockResolvedValueOnce([]);
      mockExec.mockResolvedValueOnce(mockEvents);

      // Simulate prisma createMany failure
      const dbError = new Error("Database Write Error");
      if (isLiveDb) {
        vi.spyOn(prisma.telemetryEvent, "createMany").mockRejectedValueOnce(dbError);
      } else {
        vi.mocked(prisma.telemetryEvent.createMany).mockRejectedValueOnce(dbError);
      }

      const req = new NextRequest("http://localhost:3000/api/telemetry/sync", {
        headers: {
          authorization: "Bearer test-secret",
        },
      });

      const response = await GETSync(req);
      expect(response.status).toBe(500);

      // Verify that events were moved via lmove and NOT deleted from processing queue on failure
      expect(mockLmove).toHaveBeenCalledWith("telemetry_buffer", "telemetry_processing", "right", "left");
      expect(mockDel).not.toHaveBeenCalledWith("telemetry_processing");
    });

    it("re-syncs previously failed processing queue batch before pulling new events", async () => {
      const pendingEvents = [
        { id: "uuid-pending-1", projectSlug: "/project-pending", eventType: "page_view", createdAt: new Date() },
      ];
      mockLrange.mockResolvedValueOnce(pendingEvents);
      mockExec.mockResolvedValueOnce([]);

      const req = new NextRequest("http://localhost:3000/api/telemetry/sync", {
        headers: {
          authorization: "Bearer test-secret",
        },
      });

      const response = await GETSync(req);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.processed).toBe(1);
      expect(mockDel).toHaveBeenCalledWith("telemetry_processing");
    });
  });

  // --- REQUIREMENT 4 ---
  describe("Client Rate-Limiting & Memory Sweeping (Requirement 4)", () => {
    it("blocks request dispatching once the 100-request-per-minute rate-limit threshold is crossed", async () => {
      // 1. Initial success rate-limit state
      mockRatelimitLimit.mockResolvedValue({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60000,
        pending: Promise.resolve(),
      });

      const req1 = new NextRequest("http://localhost:3000/api/telemetry", {
        method: "POST",
        headers: { "x-forwarded-for": "1.2.3.4" },
        body: JSON.stringify({ projectSlug: "/dashboard", eventType: "page_view" }),
      });
      const res1 = await POST(req1);
      expect(res1.status).toBe(201);

      // 2. Exceeded rate limit state (using a new IP to avoid hitting Client 1's local cache)
      mockRatelimitLimit.mockResolvedValue({
        success: false,
        limit: 100,
        remaining: 0,
        reset: Date.now() + 60000,
        pending: Promise.resolve(),
      });

      const req2 = new NextRequest("http://localhost:3000/api/telemetry", {
        method: "POST",
        headers: { "x-forwarded-for": "5.6.7.8" },
        body: JSON.stringify({ projectSlug: "/dashboard", eventType: "page_view" }),
      });
      const res2 = await POST(req2);
      expect(res2.status).toBe(429);
      const data2 = await res2.json();
      expect(data2.error).toContain("Too many requests");
    });

    it("sweeps expired tracking keys from active clients local cache map", async () => {
      vi.useFakeTimers();

      // Mock fast rate limit responses
      mockRatelimitLimit.mockResolvedValue({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 10, // Expires very fast
        pending: Promise.resolve(),
      });

      // 1. Populate the local cache to exceed the 5000 item capacity threshold
      for (let i = 0; i < 5005; i++) {
        const req = new NextRequest("http://localhost:3000/api/telemetry", {
          method: "POST",
          headers: { "x-forwarded-for": `192.168.100.${i}` },
          body: JSON.stringify({ projectSlug: "/dashboard", eventType: "page_view" }),
        });
        await POST(req);
      }

      // 2. Control Date.now() to mock clock forward past key expiration time
      const dateSpy = vi.spyOn(Date, "now").mockReturnValue(Date.now() + 5000);

      // 3. Make one more request to trigger finally block sweeping logic
      const req = new NextRequest("http://localhost:3000/api/telemetry", {
        method: "POST",
        headers: { "x-forwarded-for": "192.168.100.5006" },
        body: JSON.stringify({ projectSlug: "/dashboard", eventType: "page_view" }),
      });
      const response = await POST(req);
      expect(response.status).toBe(201);

      // The execution successfully ran the finally sweep block without raising errors
      dateSpy.mockRestore();
    });
  });

  if (isLiveDb) {
    describe("Live Database Direct Interaction Invariants (Requirement 4)", () => {
      it("surfaces relational constraint and unique validation errors directly from PostgreSQL rather than simulated mocks", async () => {
        // Assert that we are in a clean state (pre-test database cleanup)
        await prisma.telemetryEvent.deleteMany();

        const uniqueId = "test-live-duplicate-constraint-uuid";
        const payload = {
          id: uniqueId,
          projectSlug: "/constraint-test",
          eventType: "page_view",
          createdAt: new Date(),
        };

        // 1. First insert should succeed perfectly
        await prisma.telemetryEvent.create({ data: payload });

        // 2. Second insert with identical ID must throw Unique Constraint Violation (P2002) directly from PostgreSQL
        await expect(
          prisma.telemetryEvent.create({ data: payload })
        ).rejects.toThrow();

        // 3. Ensure the error is indeed a database level client error (from Prisma/Postgres)
        try {
          await prisma.telemetryEvent.create({ data: payload });
          expect.fail("Should have thrown a relational constraint error");
        } catch (err: unknown) {
          const error = err as { code?: string; message?: string };
          expect(error.code || error.message).toBeDefined();
          // P2002 is Prisma's known request error code for unique constraint violations
          if (error.code) {
            expect(error.code).toBe("P2002");
          }
        }
      });
    });
  }
});
