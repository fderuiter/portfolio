import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as ingestPOST } from "@/app/api/admin/ingest/route";
import { GET as randomGET } from "@/app/api/repositories/random/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getGitHubStats } from "@/lib/github";

// Mock dependencies
vi.mock("@/lib/db", () => {
  return {
    prisma: {
      archivedRepository: {
        count: vi.fn(),
        findFirst: vi.fn(),
        upsert: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/github", () => {
  return {
    parseGitHubUrl: vi.fn((url: string) => {
      if (url.includes("github.com/owner/repo")) {
        return { owner: "owner", repo: "repo" };
      }
      return null;
    }),
    getGitHubStats: vi.fn(),
  };
});

describe("Graveyard & Ingestion API Endpoints", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  describe("Administrative Ingestion POST Endpoint", () => {
    it("should fail with 401 if unauthorized in production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("CRON_SECRET", "super_secret");

      const req = new NextRequest("http://localhost:3000/api/admin/ingest", {
        method: "POST",
        body: JSON.stringify({ url: "https://github.com/owner/repo" }),
      });

      const res = await ingestPOST(req);
      expect(res.status).toBe(401);
    });

    it("should succeed and save parsed metrics if authorized", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("CRON_SECRET", "super_secret");

      const mockStats = {
        stars: 42,
        forks: 10,
        openIssues: 2,
        languages: [{ name: "TypeScript", percentage: 100 }],
        recentCommits: [],
        commitActivity: [10, 20, 30],
      };
      vi.mocked(getGitHubStats).mockResolvedValue(mockStats);

      const mockSavedRecord = {
        id: "cuid-1",
        url: "https://github.com/owner/repo",
        name: "repo",
        languageBreakdown: { TypeScript: 100 },
        commitCount: 60, // sum of activity
        stars: 42,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(prisma.archivedRepository.upsert).mockResolvedValue(mockSavedRecord);

      const req = new NextRequest("http://localhost:3000/api/admin/ingest", {
        method: "POST",
        headers: {
          authorization: "Bearer super_secret",
        },
        body: JSON.stringify({ url: "https://github.com/owner/repo" }),
      });

      const res = await ingestPOST(req);
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.repository.name).toBe("repo");
      expect(data.repository.commitCount).toBe(60);
      expect(data.repository.stars).toBe(42);

      expect(prisma.archivedRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { url: "https://github.com/owner/repo" },
          create: expect.objectContaining({
            commitCount: 60,
            stars: 42,
          }),
        })
      );
    });

    it("should return 400 for invalid/malformed GitHub URL", async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("CRON_SECRET", ""); // permit without credentials in dev

      const req = new NextRequest("http://localhost:3000/api/admin/ingest", {
        method: "POST",
        body: JSON.stringify({ url: "https://invalid-host.com/not-github" }),
      });

      const res = await ingestPOST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Invalid GitHub repository URL");
    });
  });

  describe("Random Archived Repository GET Endpoint", () => {
    it("should return null if no archived repositories exist", async () => {
      vi.mocked(prisma.archivedRepository.count).mockResolvedValue(0);

      const res = await randomGET();
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.repository).toBeNull();
    });

    it("should return a random repository if some exist", async () => {
      vi.mocked(prisma.archivedRepository.count).mockResolvedValue(5);
      const mockRecord = {
        id: "cuid-2",
        url: "https://github.com/owner/repo2",
        name: "repo2",
        languageBreakdown: { Rust: 100 },
        commitCount: 50,
        stars: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(prisma.archivedRepository.findFirst).mockResolvedValue(mockRecord);

      const res = await randomGET();
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.repository.id).toBe(mockRecord.id);
      expect(data.repository.name).toBe(mockRecord.name);
      expect(data.repository.url).toBe(mockRecord.url);
      expect(data.repository.commitCount).toBe(mockRecord.commitCount);
      expect(data.repository.stars).toBe(mockRecord.stars);
    });
  });
});
