import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as telemetryPOST } from "@/app/api/telemetry/route";
import { GET as syncGET } from "@/app/api/telemetry/sync/route";
import { GET as transparencyGET } from "@/app/api/transparency/logs/route";
import * as githubLib from "@/lib/github";
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

vi.mock("@upstash/ratelimit", () => {
  return {
    Ratelimit: class {
      static slidingWindow = vi.fn();
      limit = vi.fn().mockResolvedValue({
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60000,
        pending: Promise.resolve(),
      });
    },
  };
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

    it("returns dynamic workflow runs when GitHub Actions API is fully available", async () => {
      vi.mocked(prisma.telemetryEvent.findMany).mockResolvedValue([]);
      const spy = vi.spyOn(githubLib, "getGitHubWorkflowRuns").mockResolvedValue([
        {
          id: 555,
          name: "CI Pipeline",
          status: "completed",
          conclusion: "success",
          html_url: "https://github.com/fderuiter/portfolio/actions/runs/555",
          created_at: "2026-08-13T10:00:00Z",
          updated_at: "2026-08-13T10:01:30Z",
          head_branch: "main",
        }
      ]);

      const req = new NextRequest("http://localhost:3000/api/transparency/logs", {
        method: "GET",
      });

      const res = await transparencyGET(req);
      expect(res.status).toBe(200);

      const logs = await res.json();
      // Should contain 2 items representing the CI Pipeline (Reliability and Security)
      expect(logs).toHaveLength(2);
      
      const reliabilityLog = logs.find((l: any) => l.category === "Reliability");
      expect(reliabilityLog).toBeDefined();
      expect(reliabilityLog.message).toContain("CI/CD automated build and deploy for main branch (Duration: 90s)");
      expect(reliabilityLog.status).toBe("SUCCESS");
      expect(reliabilityLog.link).toBe("https://github.com/fderuiter/portfolio/actions/runs/555");

      const securityLog = logs.find((l: any) => l.category === "Security");
      expect(securityLog).toBeDefined();
      expect(securityLog.message).toContain("Automated dependency security audit completed. Zero critical vulnerabilities found.");
      expect(securityLog.status).toBe("SUCCESS");

      spy.mockRestore();
    });

    it("gracefully falls back to degraded mode when GitHub Actions API fails", async () => {
      vi.mocked(prisma.telemetryEvent.findMany).mockResolvedValue([]);
      const spy = vi.spyOn(githubLib, "getGitHubWorkflowRuns").mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/transparency/logs", {
        method: "GET",
      });

      const res = await transparencyGET(req);
      expect(res.status).toBe(200);

      const logs = await res.json();
      // Should contain 2 items representing the degraded fallback warning logs
      expect(logs).toHaveLength(2);
      
      const reliabilityLog = logs.find((l: any) => l.category === "Reliability");
      expect(reliabilityLog).toBeDefined();
      expect(reliabilityLog.message).toContain("Real-time build and deploy telemetry feed is temporarily offline. (Degraded Mode)");
      expect(reliabilityLog.status).toBe("INFO");

      const securityLog = logs.find((l: any) => l.category === "Security");
      expect(securityLog).toBeDefined();
      expect(securityLog.message).toContain("Live security scan validation status is temporarily offline. (Degraded Mode)");
      expect(securityLog.status).toBe("INFO");

      spy.mockRestore();
    });
  });
});
