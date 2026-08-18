import { prisma } from "@/lib/db";
import DOMPurify from "isomorphic-dompurify";
import { env } from "@/lib/env";
import { redis } from "@/lib/redis";

export interface CaseStudySubmissionInput {
  title: string;
  slug: string;
  primary_language: string;
  editorial_content: string;
  architectural_narrative: string;
  tags: string;
  github_url?: string | null;
}

export interface FeedbackSubmissionInput {
  caseStudySlug: string;
  takeaways: string[];
  comments: string;
}

export interface ReactionSubmissionInput {
  caseStudySlug: string;
  reactionType: string;
}

const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "code", "pre", "strong", "em", "b", "i",
    "a", "ul", "ol", "li", "span", "abbr", "blockquote", "br", "div"
  ],
  ALLOWED_ATTR: [
    "href", "target", "rel", "class",
    "data-term", "data-definition", "data-key",
    "role", "tabindex", "aria-label", "aria-describedby", "aria-hidden"
  ]
};

const ALLOWED_REACTIONS = ["insightful", "mind_blowing", "actionable", "thorough"] as const;

// In-memory fallback stores for offline/mock environments
const mockFeedbackStore = new Map<string, Array<{ takeaways: string[]; comments: string; connectionHash: string; createdAt: string }>>();
const mockReactionsStore = new Map<string, Map<string, number>>();

interface RedisFeedbackEntry {
  id: string;
  caseStudySlug: string;
  takeaways: string[];
  comments: string;
  connectionHash: string;
  createdAt: string;
}

interface RedisReactionEntry {
  caseStudySlug: string;
  reactionType: string;
  connectionHash: string;
  createdAt: string;
}

async function getRedisFallbackFeedback(slug: string): Promise<RedisFeedbackEntry[]> {
  try {
    const rawList = await redis.lrange(`fallback:feedback:${slug}`, 0, -1);
    if (!Array.isArray(rawList)) return [];
    return rawList
      .map((item) => {
        try {
          return typeof item === "string" ? JSON.parse(item) : item;
        } catch {
          return null;
        }
      })
      .filter((item): item is RedisFeedbackEntry => item !== null && typeof item === "object" && !!item.connectionHash);
  } catch {
    return [];
  }
}

async function getRedisFallbackReactions(slug: string): Promise<RedisReactionEntry[]> {
  try {
    const rawList = await redis.lrange(`fallback:reactions:${slug}`, 0, -1);
    if (!Array.isArray(rawList)) return [];
    return rawList
      .map((item) => {
        try {
          return typeof item === "string" ? JSON.parse(item) : item;
        } catch {
          return null;
        }
      })
      .filter((item): item is RedisReactionEntry => item !== null && typeof item === "object" && !!item.reactionType);
  } catch {
    return [];
  }
}

function getDefaultReactionCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of ALLOWED_REACTIONS) {
    counts[r] = 0;
  }
  return counts;
}

export class CaseStudyService {
  /**
   * Retrieves all published case studies for public search/discovery.
   */
  static async getPublishedCaseStudies() {
    if (env.PLAYWRIGHT_TEST === "true") {
      return [
        {
          id: "clinical-data-mapper",
          slug: "clinical-data-mapper",
          title: "Clinical Data Mapper",
          primary_language: "TypeScript",
          tags: "clinical, edc, mapping"
        },
        {
          id: "cadence-clinical",
          slug: "cadence-clinical",
          title: "Cadence Clinical",
          primary_language: "TypeScript",
          tags: "clinical, telemetry, real-time"
        },
        {
          id: "imednet-python-sdk",
          slug: "imednet-python-sdk",
          title: "iMedNet Python SDK",
          primary_language: "Python",
          tags: "sdk, clinical, integration"
        },
        {
          id: "inbody-qr-decoder",
          slug: "inbody-qr-decoder",
          title: "InBody QR Data Decoder",
          primary_language: "Python",
          tags: "python, reverse-engineering, qr-decoder, biometrics"
        }
      ];
    }

    return await prisma.caseStudy.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        primary_language: true,
        tags: true
      }
    });
  }

  /**
   * Sanitizes rich text / HTML content submissions and persists draft case study.
   */
  static async submitCaseStudy(input: CaseStudySubmissionInput) {
    const {
      title,
      slug,
      primary_language,
      editorial_content,
      architectural_narrative,
      tags,
      github_url
    } = input;

    // Sanitize HTML input content through DOMPurify to strip malicious scripts and event handlers
    const sanitizedEditorial = DOMPurify.sanitize(editorial_content, SANITIZE_OPTIONS);
    const sanitizedNarrative = DOMPurify.sanitize(architectural_narrative, SANITIZE_OPTIONS);

    return await prisma.caseStudy.create({
      data: {
        title,
        slug,
        primary_language,
        editorial_content: sanitizedEditorial,
        architectural_narrative: sanitizedNarrative,
        tags,
        github_url: github_url || null,
        published: false,
        simulated_telemetry: false,
      },
    });
  }

  /**
   * Fetches user feedback for a given case study slug.
   */
  static async getFeedback(slug: string, connectionHash: string) {
    const fallbackList = await getRedisFallbackFeedback(slug);
    const mockList = mockFeedbackStore.get(slug) || [];

    try {
      const dbFeedbackList = await prisma.caseStudyFeedback.findMany({
        where: { caseStudySlug: slug },
        select: {
          id: true,
          takeaways: true,
          comments: true,
          createdAt: true,
          connectionHash: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      const hasSubmitted =
        dbFeedbackList.some((f) => f.connectionHash === connectionHash) ||
        fallbackList.some((f) => f.connectionHash === connectionHash) ||
        mockList.some((f) => f.connectionHash === connectionHash);

      const formattedDbFeedback = dbFeedbackList.map((f) => ({
        id: f.id,
        takeaways: JSON.parse(f.takeaways || "[]"),
        comments: f.comments,
        createdAt: f.createdAt,
      }));

      const dbIds = new Set(formattedDbFeedback.map((f) => f.id));
      const formattedFallbackFeedback = fallbackList
        .filter((f) => !dbIds.has(f.id))
        .map((f) => ({
          id: f.id,
          takeaways: f.takeaways,
          comments: f.comments,
          createdAt: f.createdAt ? new Date(f.createdAt) : new Date(),
        }));

      const mergedFeedback = [...formattedDbFeedback, ...formattedFallbackFeedback];

      return {
        success: true,
        caseStudySlug: slug,
        hasSubmitted,
        totalFeedback: mergedFeedback.length,
        feedback: mergedFeedback,
      };
    } catch (err) {
      if (env.VERCEL_ENV === "production") {
        console.error("Failed to query case study feedback:", err);
      }

      const combinedFallback = [
        ...fallbackList,
        ...mockList.map((f, i) => ({
          id: `mock-${i}`,
          caseStudySlug: slug,
          takeaways: f.takeaways,
          comments: f.comments,
          connectionHash: f.connectionHash,
          createdAt: f.createdAt,
        })),
      ];

      const hasSubmitted = combinedFallback.some((f) => f.connectionHash === connectionHash);

      return {
        success: true,
        caseStudySlug: slug,
        hasSubmitted,
        totalFeedback: combinedFallback.length,
        feedback: combinedFallback.map((f) => ({
          id: f.id,
          takeaways: f.takeaways,
          comments: f.comments,
          createdAt: f.createdAt ? new Date(f.createdAt) : new Date(),
        })),
      };
    }
  }

  /**
   * Submits feedback for a case study with duplicate rate-limiting.
   */
  static async submitFeedback(input: FeedbackSubmissionInput, connectionHash: string) {
    const { caseStudySlug, takeaways, comments } = input;

    // Check duplicate in Redis fallback storage first
    const fallbackList = await getRedisFallbackFeedback(caseStudySlug);
    const existingFallback = fallbackList.find((f) => f.connectionHash === connectionHash);

    // Check duplicate in mock store
    const existingMock = (mockFeedbackStore.get(caseStudySlug) || []).find(
      (f) => f.connectionHash === connectionHash
    );

    if (existingFallback || existingMock) {
      return {
        rateLimited: true,
        message: "Feedback already submitted for this case study. Please try again later.",
      };
    }

    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const existing = await prisma.caseStudyFeedback.findFirst({
        where: {
          caseStudySlug,
          connectionHash,
          createdAt: { gte: oneHourAgo },
        },
      });

      if (existing) {
        return {
          rateLimited: true,
          message: "Feedback already submitted for this case study. Please try again later.",
        };
      }

      const created = await prisma.caseStudyFeedback.create({
        data: {
          caseStudySlug,
          takeaways: JSON.stringify(takeaways),
          comments,
          connectionHash,
        },
      });

      return {
        rateLimited: false,
        success: true,
        message: "Feedback submitted successfully",
        feedback: {
          id: created.id,
          caseStudySlug: created.caseStudySlug,
          takeaways,
          comments: created.comments,
          createdAt: created.createdAt,
        },
      };
    } catch (dbErr) {
      if (env.VERCEL_ENV === "production") {
        console.error("Database feedback creation failed, using fallback:", dbErr);
      }

      const newEntry: RedisFeedbackEntry = {
        id: `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        caseStudySlug,
        takeaways,
        comments,
        connectionHash,
        createdAt: new Date().toISOString(),
      };

      try {
        const p = redis.pipeline();
        p.lpush(`fallback:feedback:${caseStudySlug}`, JSON.stringify(newEntry));
        p.expire(`fallback:feedback:${caseStudySlug}`, 172800);
        await p.exec();
      } catch (redisErr) {
        if (env.VERCEL_ENV === "production") {
          console.error("Redis fallback feedback write failed:", redisErr);
        }
      }

      const list = mockFeedbackStore.get(caseStudySlug) || [];
      mockFeedbackStore.set(caseStudySlug, [...list, newEntry]);

      return {
        rateLimited: false,
        success: true,
        message: "Feedback submitted successfully",
        feedback: {
          id: newEntry.id,
          caseStudySlug,
          takeaways,
          comments,
          createdAt: newEntry.createdAt,
        },
      };
    }
  }

  /**
   * Gets aggregated reactions for a case study.
   */
  static async getReactions(slug: string, connectionHash: string) {
    const fallbackList = await getRedisFallbackReactions(slug);
    const mockMap = mockReactionsStore.get(slug);

    try {
      const reactions = await prisma.caseStudyReaction.groupBy({
        by: ["reactionType"],
        where: { caseStudySlug: slug },
        _count: { id: true },
      });

      const userReactionsList = await prisma.caseStudyReaction.findMany({
        where: { caseStudySlug: slug, connectionHash },
        select: { reactionType: true },
      });

      const counts = getDefaultReactionCounts();
      for (const r of reactions) {
        if (counts[r.reactionType] !== undefined) {
          counts[r.reactionType] = r._count.id;
        }
      }

      for (const fb of fallbackList) {
        if (counts[fb.reactionType] !== undefined) {
          counts[fb.reactionType] += 1;
        }
      }

      if (mockMap) {
        for (const [r, count] of mockMap.entries()) {
          if (counts[r] !== undefined) {
            counts[r] += count;
          }
        }
      }

      const userReactionsSet = new Set(userReactionsList.map((ur) => ur.reactionType));
      for (const fb of fallbackList) {
        if (fb.connectionHash === connectionHash) {
          userReactionsSet.add(fb.reactionType);
        }
      }

      return {
        success: true,
        caseStudySlug: slug,
        counts,
        userReactions: Array.from(userReactionsSet),
      };
    } catch (err) {
      if (env.VERCEL_ENV === "production") {
        console.error("Failed to query case study reactions:", err);
      }

      const counts = getDefaultReactionCounts();

      for (const fb of fallbackList) {
        if (counts[fb.reactionType] !== undefined) {
          counts[fb.reactionType] += 1;
        }
      }

      if (mockMap) {
        for (const [r, count] of mockMap.entries()) {
          if (counts[r] !== undefined) {
            counts[r] += count;
          }
        }
      }

      const userReactionsSet = new Set<string>();
      for (const fb of fallbackList) {
        if (fb.connectionHash === connectionHash) {
          userReactionsSet.add(fb.reactionType);
        }
      }

      return {
        success: true,
        caseStudySlug: slug,
        counts,
        userReactions: Array.from(userReactionsSet),
      };
    }
  }

  /**
   * Submits a reaction for a case study.
   */
  static async submitReaction(input: ReactionSubmissionInput, connectionHash: string) {
    const { caseStudySlug, reactionType } = input;

    const fallbackList = await getRedisFallbackReactions(caseStudySlug);
    const existingFallback = fallbackList.some(
      (fb) => fb.reactionType === reactionType && fb.connectionHash === connectionHash
    );

    try {
      const existing = await prisma.caseStudyReaction.findFirst({
        where: {
          caseStudySlug,
          reactionType,
          connectionHash,
        },
      });

      if (!existing && !existingFallback) {
        await prisma.caseStudyReaction.create({
          data: {
            caseStudySlug,
            reactionType,
            connectionHash,
          },
        });
      }

      const res = await CaseStudyService.getReactions(caseStudySlug, connectionHash);
      return {
        ...res,
        reactionType,
      };
    } catch (dbErr) {
      if (env.VERCEL_ENV === "production") {
        console.error("Database reaction creation failed, using fallback:", dbErr);
      }

      if (!existingFallback) {
        const newReaction: RedisReactionEntry = {
          caseStudySlug,
          reactionType,
          connectionHash,
          createdAt: new Date().toISOString(),
        };

        try {
          const p = redis.pipeline();
          p.lpush(`fallback:reactions:${caseStudySlug}`, JSON.stringify(newReaction));
          p.expire(`fallback:reactions:${caseStudySlug}`, 172800);
          await p.exec();
        } catch (redisErr) {
          if (env.VERCEL_ENV === "production") {
            console.error("Redis fallback reaction write failed:", redisErr);
          }
          if (!mockReactionsStore.has(caseStudySlug)) {
            mockReactionsStore.set(caseStudySlug, new Map());
          }
          const slugMap = mockReactionsStore.get(caseStudySlug)!;
          const currentCount = slugMap.get(reactionType) || 0;
          slugMap.set(reactionType, currentCount + 1);
        }
      }

      const updatedFallbackList = await getRedisFallbackReactions(caseStudySlug);
      const mockMap = mockReactionsStore.get(caseStudySlug);
      const counts = getDefaultReactionCounts();

      for (const fb of updatedFallbackList) {
        if (counts[fb.reactionType] !== undefined) {
          counts[fb.reactionType] += 1;
        }
      }

      if (mockMap) {
        for (const [r, count] of mockMap.entries()) {
          if (counts[r] !== undefined) {
            counts[r] += count;
          }
        }
      }

      const userReactionsSet = new Set<string>();
      for (const fb of updatedFallbackList) {
        if (fb.connectionHash === connectionHash) {
          userReactionsSet.add(fb.reactionType);
        }
      }
      if (mockMap && mockMap.has(reactionType)) {
        userReactionsSet.add(reactionType);
      }

      return {
        success: true,
        reactionType,
        counts,
        userReactions: Array.from(userReactionsSet),
      };
    }
  }
}
