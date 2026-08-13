import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted to declare the mock function before any imports or mocks are executed
const { mockRatelimitLimit } = vi.hoisted(() => {
  return { mockRatelimitLimit: vi.fn() };
});

// Mock the dependencies
vi.mock("@/lib/db", () => {
  return {
    prisma: {
      telemetryEvent: {
        create: vi.fn(),
        groupBy: vi.fn(),
      },
    },
  };
});

vi.mock("@upstash/redis", () => {
  class MockRedis {
    pipeline() {
      return {
        lpush: vi.fn(),
        expire: vi.fn(),
        exec: vi.fn().mockResolvedValue([1]),
      };
    }
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

// Import endpoints AFTER setting up the hoisted variables and mocks
import { POST } from "@/app/api/telemetry/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

describe("Telemetry API Route - Route Error Telemetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default rate limit behavior to success for existing tests
    mockRatelimitLimit.mockReset().mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    });
  });

  it("should accept 'route_error' event type and save it in the database", async () => {
    const payload = {
      projectSlug: "/non-existent-page-link",
      eventType: "route_error",
    };

    // Mock successful database write
    const mockDbResponse = {
      id: "some-uuid",
      projectSlug: "/non-existent-page-link",
      eventType: "route_error",
      createdAt: new Date(),
    };
    vi.mocked(prisma.telemetryEvent.create).mockResolvedValue(mockDbResponse);

    // Construct the NextRequest
    const req = new NextRequest("http://localhost:3000/api/telemetry", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.event.projectSlug).toBe("/non-existent-page-link");
    expect(data.event.eventType).toBe("route_error");

    expect(prisma.telemetryEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectSlug: "/non-existent-page-link",
          eventType: "route_error",
        }),
      })
    );
  });

  it("should reject invalid event types with 400 status", async () => {
    const payload = {
      projectSlug: "/some-path",
      eventType: "invalid_event_type",
    };

    const req = new NextRequest("http://localhost:3000/api/telemetry", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain("Missing or invalid eventType");
    expect(prisma.telemetryEvent.create).not.toHaveBeenCalled();
  });

  it("should reject client with 429 when rate limit is exceeded", async () => {
    mockRatelimitLimit.mockResolvedValue({
      success: false,
      limit: 100,
      remaining: 0,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    });

    const payload = {
      projectSlug: "/dashboard",
      eventType: "page_view",
    };

    const req = new NextRequest("http://localhost:3000/api/telemetry", {
      method: "POST",
      headers: {
        "x-forwarded-for": "10.0.0.1",
      },
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
    
    const data = await res.json();
    expect(data.error).toContain("Too many requests");

    // Standard headers check
    expect(res.headers.get("X-RateLimit-Limit")).toBe("100");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(res.headers.get("X-RateLimit-Reset")).toBeDefined();
  });

  it("should cache active, valid clients locally to bypass remote rate limiter checks", async () => {
    // Configure the rate limiter mock to return success
    const mockResetTime = Date.now() + 10000;
    mockRatelimitLimit.mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: mockResetTime,
      pending: Promise.resolve(),
    });

    const payload = {
      projectSlug: "/dashboard",
      eventType: "page_view",
    };

    // Mock database write success
    vi.mocked(prisma.telemetryEvent.create).mockResolvedValue({
      id: "uuid-1",
      projectSlug: "/dashboard",
      eventType: "page_view",
      createdAt: new Date(),
    });

    // First request
    const req1 = new NextRequest("http://localhost:3000/api/telemetry", {
      method: "POST",
      headers: {
        "x-forwarded-for": "192.168.1.1",
      },
      body: JSON.stringify(payload),
    });

    const res1 = await POST(req1);
    expect(res1.status).toBe(201);
    expect(mockRatelimitLimit).toHaveBeenCalledTimes(1);

    // Second request from the same IP (should hit local cache and bypass remote check)
    const req2 = new NextRequest("http://localhost:3000/api/telemetry", {
      method: "POST",
      headers: {
        "x-forwarded-for": "192.168.1.1",
      },
      body: JSON.stringify(payload),
    });

    const res2 = await POST(req2);
    expect(res2.status).toBe(201);
    // The rate limiter limit mock should NOT have been called a second time!
    expect(mockRatelimitLimit).toHaveBeenCalledTimes(1);
  });

  it("should accept 'contact_click' event type and save it in the database", async () => {
    const payload = {
      projectSlug: "contact-email",
      eventType: "contact_click",
    };

    const mockDbResponse = {
      id: "some-uuid-2",
      projectSlug: "contact-email",
      eventType: "contact_click",
      createdAt: new Date(),
    };
    vi.mocked(prisma.telemetryEvent.create).mockResolvedValue(mockDbResponse);

    const req = new NextRequest("http://localhost:3000/api/telemetry", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.event.projectSlug).toBe("contact-email");
    expect(data.event.eventType).toBe("contact_click");
  });

  it("should accept 'simulator_milestone' event type and save it in the database", async () => {
    const payload = {
      projectSlug: "imednet-python-sdk",
      eventType: "simulator_milestone",
    };

    const mockDbResponse = {
      id: "some-uuid-3",
      projectSlug: "imednet-python-sdk",
      eventType: "simulator_milestone",
      createdAt: new Date(),
    };
    vi.mocked(prisma.telemetryEvent.create).mockResolvedValue(mockDbResponse);

    const req = new NextRequest("http://localhost:3000/api/telemetry", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.event.projectSlug).toBe("imednet-python-sdk");
    expect(data.event.eventType).toBe("simulator_milestone");
  });
});
