import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/telemetry/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

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

describe("Telemetry API Route - Route Error Telemetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
