import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Hoisted mock variables
const { mockRatelimitLimit, mockLpush, mockExpire, mockExec, mockLrange } = vi.hoisted(() => {
  return {
    mockRatelimitLimit: vi.fn().mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    }),
    mockLpush: vi.fn(),
    mockExpire: vi.fn(),
    mockExec: vi.fn().mockResolvedValue([1]),
    mockLrange: vi.fn().mockResolvedValue([]),
  };
});

vi.mock("@upstash/redis", () => {
  class MockRedis {
    pipeline() {
      return {
        lpush: mockLpush,
        expire: mockExpire,
        exec: mockExec,
      };
    }
    lrange = mockLrange;
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

import { POST as feedbackPOST, GET as feedbackGET } from "@/app/api/case-studies/feedback/route";
import { POST as reactionPOST, GET as reactionGET } from "@/app/api/case-studies/reactions/route";
import { prisma } from "@/lib/db";

describe("Case Study Feedback & Reaction API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRatelimitLimit.mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    });
    mockLrange.mockResolvedValue([]);
    mockExec.mockResolvedValue([1]);
  });

  describe("Feedback API (/api/case-studies/feedback)", () => {
    it("should reject GET requests missing slug parameter with 400", async () => {
      const req = new NextRequest("http://localhost/api/case-studies/feedback");
      const res = await feedbackGET(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toContain("Missing required query parameter");
    });

    it("should handle GET requests with valid slug parameter", async () => {
      const req = new NextRequest("http://localhost/api/case-studies/feedback?slug=imednet-python-sdk");
      const res = await feedbackGET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.caseStudySlug).toBe("imednet-python-sdk");
      expect(Array.isArray(json.feedback)).toBe(true);
    });

    it("should reject feedback submission with missing or empty fields with 400", async () => {
      const req = new NextRequest("http://localhost/api/case-studies/feedback", {
        method: "POST",
        body: JSON.stringify({
          caseStudySlug: "",
          takeaways: [],
          comments: "hi",
        }),
      });

      const res = await feedbackPOST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toBe("Validation failed");
      expect(json.details.length).toBeGreaterThan(0);
    });

    it("should reject feedback submission with comments exceeding max length with 400", async () => {
      const longComment = "a".repeat(2001);
      const req = new NextRequest("http://localhost/api/case-studies/feedback", {
        method: "POST",
        body: JSON.stringify({
          caseStudySlug: "imednet-python-sdk",
          takeaways: ["Architecture & System Design"],
          comments: longComment,
        }),
      });

      const res = await feedbackPOST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toBe("Validation failed");
    });

    it("should accept valid feedback submission with 201", async () => {
      const req = new NextRequest("http://localhost/api/case-studies/feedback", {
        method: "POST",
        headers: { "x-forwarded-for": "192.168.1.100", "user-agent": "test-agent" },
        body: JSON.stringify({
          caseStudySlug: "imednet-python-sdk",
          takeaways: ["Architecture & System Design", "Error Handling & Resilience"],
          comments: "Great breakdown of the clinical trial architecture and error handling patterns.",
        }),
      });

      const res = await feedbackPOST(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.feedback.caseStudySlug).toBe("imednet-python-sdk");
      expect(json.feedback.comments).toContain("Great breakdown");
    });

    it("should prevent duplicate submissions from same connection hash with 429", async () => {
      const uniqueIp = `10.0.0.${Math.floor(Math.random() * 200) + 10}`;
      const uniqueSlug = `test-study-${Date.now()}`;

      const req1 = new NextRequest("http://localhost/api/case-studies/feedback", {
        method: "POST",
        headers: { "x-forwarded-for": uniqueIp, "user-agent": "dup-agent" },
        body: JSON.stringify({
          caseStudySlug: uniqueSlug,
          takeaways: ["Testing Protocols & QA"],
          comments: "Initial thorough review of QA procedures.",
        }),
      });

      const res1 = await feedbackPOST(req1);
      expect(res1.status).toBe(201);

      const req2 = new NextRequest("http://localhost/api/case-studies/feedback", {
        method: "POST",
        headers: { "x-forwarded-for": uniqueIp, "user-agent": "dup-agent" },
        body: JSON.stringify({
          caseStudySlug: uniqueSlug,
          takeaways: ["Performance Optimization"],
          comments: "Second submission attempt within short window.",
        }),
      });

      const res2 = await feedbackPOST(req2);
      expect(res2.status).toBe(429);
      const json = await res2.json();
      expect(json.error).toContain("already submitted");
    });

    it("should trigger standardized 429 rate limit response when request frequency exceeds sliding-window boundary", async () => {
      mockRatelimitLimit.mockResolvedValueOnce({
        success: false,
        limit: 100,
        remaining: 0,
        reset: Date.now() + 60000,
      });

      const req = new NextRequest("http://localhost/api/case-studies/feedback", {
        method: "POST",
        headers: { "x-forwarded-for": "10.9.9.9", "user-agent": "spammer" },
        body: JSON.stringify({
          caseStudySlug: "spammed-study",
          takeaways: ["Testing Protocols & QA"],
          comments: "Excessive rapid requests.",
        }),
      });

      const res = await feedbackPOST(req);
      expect(res.status).toBe(429);
      const json = await res.json();
      expect(json.error).toContain("Too many requests");
    });

    it("should capture feedback in Redis fallback store when primary database fails", async () => {
      const dbSpy = vi.spyOn(prisma.caseStudyFeedback, "create").mockRejectedValueOnce(new Error("Database offline"));

      const req = new NextRequest("http://localhost/api/case-studies/feedback", {
        method: "POST",
        headers: { "x-forwarded-for": "10.8.8.8", "user-agent": "fallback-agent" },
        body: JSON.stringify({
          caseStudySlug: "fallback-study",
          takeaways: ["Architecture & System Design"],
          comments: "Durable fallback entry during primary outage.",
        }),
      });

      const res = await feedbackPOST(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.feedback.id).toContain("fallback");
      expect(mockLpush).toHaveBeenCalled();
      expect(mockExpire).toHaveBeenCalledWith("feedback_fallback:fallback-study", 172800);

      dbSpy.mockRestore();
    });

    it("should evaluate duplicate check against Redis fallback entries when DB is down", async () => {
      const dbFindSpy = vi.spyOn(prisma.caseStudyFeedback, "findFirst").mockRejectedValue(new Error("Database connection error"));

      const fallbackEntry = JSON.stringify({
        id: "fallback-123",
        caseStudySlug: "dup-fallback-study",
        takeaways: ["Architecture & System Design"],
        comments: "Prior submission",
        connectionHash: "4321cba",
        createdAt: new Date().toISOString(),
      });
      mockLrange.mockResolvedValue([fallbackEntry]);

      const req = new NextRequest("http://localhost/api/case-studies/feedback", {
        method: "POST",
        headers: { "x-forwarded-for": "10.7.7.7", "user-agent": "dup-fallback-agent" },
        body: JSON.stringify({
          caseStudySlug: "dup-fallback-study",
          takeaways: ["Testing Protocols & QA"],
          comments: "Second attempt",
        }),
      });

      // Override request connection hash matching fallback entry hash by mocking hash logic
      const connectionHashModule = await import("crypto");
      const hashSpy = vi.spyOn(connectionHashModule.default, "createHash").mockReturnValue({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue("4321cba"),
      } as unknown as ReturnType<typeof connectionHashModule.default.createHash>);

      const res = await feedbackPOST(req);
      expect(res.status).toBe(429);
      const json = await res.json();
      expect(json.error).toContain("already submitted");

      hashSpy.mockRestore();
      dbFindSpy.mockRestore();
    });
  });

  describe("Reactions API (/api/case-studies/reactions)", () => {
    it("should reject GET requests missing slug with 400", async () => {
      const req = new NextRequest("http://localhost/api/case-studies/reactions");
      const res = await reactionGET(req);
      expect(res.status).toBe(400);
    });

    it("should return default reaction counts on GET for valid slug", async () => {
      const req = new NextRequest("http://localhost/api/case-studies/reactions?slug=imednet-python-sdk");
      const res = await reactionGET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.counts).toHaveProperty("insightful");
      expect(json.counts).toHaveProperty("mind_blowing");
      expect(json.counts).toHaveProperty("actionable");
      expect(json.counts).toHaveProperty("thorough");
    });

    it("should reject invalid reaction type with 400", async () => {
      const req = new NextRequest("http://localhost/api/case-studies/reactions", {
        method: "POST",
        body: JSON.stringify({
          caseStudySlug: "imednet-python-sdk",
          reactionType: "invalid_type",
        }),
      });

      const res = await reactionPOST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toBe("Validation failed");
    });

    it("should increment reaction count upon POST with 200", async () => {
      const uniqueSlug = `rx-study-${Date.now()}`;
      const req = new NextRequest("http://localhost/api/case-studies/reactions", {
        method: "POST",
        headers: { "x-forwarded-for": "10.0.1.1", "user-agent": "rx-agent" },
        body: JSON.stringify({
          caseStudySlug: uniqueSlug,
          reactionType: "insightful",
        }),
      });

      const res = await reactionPOST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.counts.insightful).toBeGreaterThanOrEqual(1);
    });

    it("should trigger standardized 429 rate limit response on reactions route", async () => {
      mockRatelimitLimit.mockResolvedValueOnce({
        success: false,
        limit: 100,
        remaining: 0,
        reset: Date.now() + 60000,
      });

      const req = new NextRequest("http://localhost/api/case-studies/reactions", {
        method: "POST",
        headers: { "x-forwarded-for": "10.6.6.6", "user-agent": "rx-spammer" },
        body: JSON.stringify({
          caseStudySlug: "rx-rate-limit-study",
          reactionType: "actionable",
        }),
      });

      const res = await reactionPOST(req);
      expect(res.status).toBe(429);
      const json = await res.json();
      expect(json.error).toContain("Too many requests");
    });

    it("should capture reaction in Redis fallback layer when database fails", async () => {
      const dbSpy = vi.spyOn(prisma.caseStudyReaction, "create").mockRejectedValueOnce(new Error("Database unavailable"));

      const req = new NextRequest("http://localhost/api/case-studies/reactions", {
        method: "POST",
        headers: { "x-forwarded-for": "10.5.5.5", "user-agent": "rx-fallback" },
        body: JSON.stringify({
          caseStudySlug: "rx-fallback-study",
          reactionType: "mind_blowing",
        }),
      });

      const res = await reactionPOST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.counts.mind_blowing).toBeGreaterThanOrEqual(1);
      expect(mockLpush).toHaveBeenCalled();
      expect(mockExpire).toHaveBeenCalledWith("reaction_fallback:rx-fallback-study", 172800);

      dbSpy.mockRestore();
    });
  });
});
