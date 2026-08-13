import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as telemetryPOST } from "@/app/api/telemetry/route";
import { GET as syncGET } from "@/app/api/telemetry/sync/route";
import { GET as transparencyGET } from "@/app/api/transparency/logs/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

// Mock database
vi.mock("@/lib/db", () => {
  return {
    prisma: {
      telemetryEvent: {
        create: vi.fn(),
        groupBy: vi.fn(),
        createMany: vi.fn(),
        findMany: vi.fn(),
      },
    },
  };
});

// Mock Upstash Redis
vi.mock("@upstash/redis", () => {
  class MockRedis {
    pipeline() {
      return {
        lpush: vi.fn(),
        expire: vi.fn(),
        rpop: vi.fn(),
        exec: vi.fn().mockResolvedValue([]),
      };
    }
  }
  return { Redis: MockRedis };
});

describe("Declarative Zod Validation Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Telemetry POST Validation", () => {
    it("successfully validates and accepts a correct payload", async () => {
      const payload = {
        projectSlug: "portfolio-website",
        eventType: "page_view",
      };

      vi.mocked(prisma.telemetryEvent.create).mockResolvedValue({
        id: "mock-uuid",
        projectSlug: "portfolio-website",
        eventType: "page_view",
        createdAt: new Date(),
      });

      const req = new NextRequest("http://localhost:3000/api/telemetry", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await telemetryPOST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it("fails validation if projectSlug is missing", async () => {
      const payload = {
        eventType: "page_view",
      };

      const req = new NextRequest("http://localhost:3000/api/telemetry", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await telemetryPOST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Missing or invalid projectSlug identifier");
      expect(data.details).toBeDefined();
    });

    it("fails validation if eventType is invalid", async () => {
      const payload = {
        projectSlug: "portfolio-website",
        eventType: "invalid_type",
      };

      const req = new NextRequest("http://localhost:3000/api/telemetry", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await telemetryPOST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Missing or invalid eventType");
      expect(data.details).toBeDefined();
    });
  });

  describe("Sync Cron GET Validation", () => {
    it("successfully validates default query params", async () => {
      vi.mocked(prisma.telemetryEvent.createMany).mockResolvedValue({ count: 0 });

      const req = new NextRequest("http://localhost:3000/api/telemetry/sync", {
        method: "GET",
      });

      const res = await syncGET(req);
      expect(res.status).toBe(200);
    });

    it("fails validation if batch parameter is invalid", async () => {
      const req = new NextRequest("http://localhost:3000/api/telemetry/sync?batch=-5", {
        method: "GET",
      });

      const res = await syncGET(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Validation failed");
      expect(data.details[0].path).toBe("batch");
    });
  });

  describe("Transparency Logs GET Validation", () => {
    it("successfully validates standard query parameters and queries database", async () => {
      vi.mocked(prisma.telemetryEvent.findMany).mockResolvedValue([]);

      const req = new NextRequest("http://localhost:3000/api/transparency/logs?sort=asc&page=2&limit=5", {
        method: "GET",
      });

      const res = await transparencyGET(req);
      expect(res.status).toBe(200);
      expect(prisma.telemetryEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "asc" },
          take: 5,
          skip: 5,
        })
      );
    });

    it("fails validation on invalid query parameters", async () => {
      const req = new NextRequest("http://localhost:3000/api/transparency/logs?sort=invalid_sort&page=-1&limit=200", {
        method: "GET",
      });

      const res = await transparencyGET(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Validation failed");
      expect(data.details).toHaveLength(3);
    });
  });
});
