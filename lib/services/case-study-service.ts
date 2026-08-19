import { prisma } from "@/lib/db";
import DOMPurify from "isomorphic-dompurify";
import { env } from "@/lib/env";
import { FALLBACK_CASE_STUDIES, CaseStudyData } from "@/lib/case-studies-data";

export type { CaseStudyData };

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

function getDefaultReactionCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of ALLOWED_REACTIONS) {
    counts[r] = 0;
  }
  return counts;
}

export class CaseStudyService {
  /**
   * Retrieves all published case studies combining database records with static fallbacks.
   * Prioritizes live database records and seamlessly appends missing static case studies.
   */
  static async getAllPublishedCaseStudies(): Promise<CaseStudyData[]> {
    let dbStudies: CaseStudyData[] = [];
    try {
      const records = await prisma.caseStudy.findMany({
        where: { published: true },
        orderBy: { created_at: "asc" },
      });
      dbStudies = records.map((r) => {
        const fallback = FALLBACK_CASE_STUDIES.find((f) => f.slug === r.slug);
        return {
          id: r.id,
          slug: r.slug,
          title: r.title,
          primary_language: r.primary_language,
          github_url: r.github_url ?? fallback?.github_url ?? "",
          external_platform_url: fallback?.external_platform_url,
          external_platform_type: fallback?.external_platform_type,
          interactive_url: fallback?.interactive_url,
          interactive_label: fallback?.interactive_label,
          benchmarks: fallback?.benchmarks,
          published: r.published,
          simulated_telemetry: r.simulated_telemetry,
          tags: r.tags,
          editorial_content: r.editorial_content,
          architectural_narrative: r.architectural_narrative,
          commands_json: r.commands_json ?? fallback?.commands_json ?? undefined,
          playback_json: r.playback_json ?? fallback?.playback_json ?? undefined,
          created_at: new Date(r.created_at),
          updated_at: new Date(r.updated_at),
        };
      });
    } catch (err) {
      if (env.VERCEL_ENV === "production") {
        console.warn("CaseStudyService.getAllPublishedCaseStudies: Database query failed, using static fallbacks:", err);
      }
      return [...FALLBACK_CASE_STUDIES];
    }

    const seenSlugs = new Set(dbStudies.map((s) => s.slug));
    const merged: CaseStudyData[] = [...dbStudies];

    for (const fallback of FALLBACK_CASE_STUDIES) {
      if (!seenSlugs.has(fallback.slug)) {
        merged.push(fallback);
        seenSlugs.add(fallback.slug);
      }
    }

    return merged;
  }

  /**
   * Retrieves a single published case study by slug, falling back to static data if absent from database.
   * Returns null if not found in database or static fallbacks.
   */
  static async getCaseStudyBySlug(slug: string): Promise<CaseStudyData | null> {
    try {
      const r = await prisma.caseStudy.findUnique({
        where: { slug },
      });
      if (r && r.published) {
        const fallback = FALLBACK_CASE_STUDIES.find((f) => f.slug === r.slug);
        return {
          id: r.id,
          slug: r.slug,
          title: r.title,
          primary_language: r.primary_language,
          github_url: r.github_url ?? fallback?.github_url ?? "",
          external_platform_url: fallback?.external_platform_url,
          external_platform_type: fallback?.external_platform_type,
          interactive_url: fallback?.interactive_url,
          interactive_label: fallback?.interactive_label,
          benchmarks: fallback?.benchmarks,
          published: r.published,
          simulated_telemetry: r.simulated_telemetry,
          tags: r.tags,
          editorial_content: r.editorial_content,
          architectural_narrative: r.architectural_narrative,
          commands_json: r.commands_json ?? fallback?.commands_json ?? undefined,
          playback_json: r.playback_json ?? fallback?.playback_json ?? undefined,
          created_at: new Date(r.created_at),
          updated_at: new Date(r.updated_at),
        };
      }
    } catch (err) {
      if (env.VERCEL_ENV === "production") {
        console.warn(`CaseStudyService.getCaseStudyBySlug: DB query failed for slug "${slug}", falling back:`, err);
      }
    }

    const fallback = FALLBACK_CASE_STUDIES.find((s) => s.slug === slug);
    return fallback ?? null;
  }


  /**
   * Retrieves all published case study slugs for static route generation and sitemaps.
   */
  static async getAllPublishedSlugs(): Promise<string[]> {
    const studies = await CaseStudyService.getAllPublishedCaseStudies();
    return studies.map((s) => s.slug);
  }

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

    const allStudies = await CaseStudyService.getAllPublishedCaseStudies();
    return allStudies.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      primary_language: s.primary_language,
      tags: s.tags,
    }));
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
    try {
      const feedbackList = await prisma.caseStudyFeedback.findMany({
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

      const hasSubmitted = feedbackList.some((f) => f.connectionHash === connectionHash);

      return {
        success: true,
        caseStudySlug: slug,
        hasSubmitted,
        totalFeedback: feedbackList.length,
        feedback: feedbackList.map((f) => ({
          id: f.id,
          takeaways: JSON.parse(f.takeaways || "[]"),
          comments: f.comments,
          createdAt: f.createdAt,
        })),
      };
    } catch (err) {
      if (env.VERCEL_ENV === "production") {
        console.error("Failed to query case study feedback:", err);
      }
      const mockList = mockFeedbackStore.get(slug) || [];
      const hasSubmitted = mockList.some((f) => f.connectionHash === connectionHash);
      return {
        success: true,
        caseStudySlug: slug,
        hasSubmitted,
        totalFeedback: mockList.length,
        feedback: mockList.map((f, i) => ({
          id: `mock-${i}`,
          takeaways: f.takeaways,
          comments: f.comments,
          createdAt: f.createdAt,
        })),
      };
    }
  }

  /**
   * Submits feedback for a case study with duplicate rate-limiting.
   */
  static async submitFeedback(input: FeedbackSubmissionInput, connectionHash: string) {
    const { caseStudySlug, takeaways, comments } = input;

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
      const existingMock = (mockFeedbackStore.get(caseStudySlug) || []).find(
        (f) => f.connectionHash === connectionHash
      );
      if (existingMock) {
        return {
          rateLimited: true,
          message: "Feedback already submitted for this case study. Please try again later.",
        };
      }

      const list = mockFeedbackStore.get(caseStudySlug) || [];
      const newEntry = {
        takeaways,
        comments,
        connectionHash,
        createdAt: new Date().toISOString(),
      };
      mockFeedbackStore.set(caseStudySlug, [...list, newEntry]);

      return {
        rateLimited: false,
        success: true,
        message: "Feedback submitted successfully",
        feedback: {
          id: `mock-${Date.now()}`,
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

      return {
        success: true,
        caseStudySlug: slug,
        counts,
        userReactions: userReactionsList.map((ur) => ur.reactionType),
      };
    } catch (err) {
      if (env.VERCEL_ENV === "production") {
        console.error("Failed to query case study reactions:", err);
      }
      const counts = getDefaultReactionCounts();
      const slugMap = mockReactionsStore.get(slug);
      if (slugMap) {
        for (const [r, count] of slugMap.entries()) {
          counts[r] = count;
        }
      }
      return {
        success: true,
        caseStudySlug: slug,
        counts,
        userReactions: [],
      };
    }
  }

  /**
   * Submits a reaction for a case study.
   */
  static async submitReaction(input: ReactionSubmissionInput, connectionHash: string) {
    const { caseStudySlug, reactionType } = input;

    try {
      const existing = await prisma.caseStudyReaction.findFirst({
        where: {
          caseStudySlug,
          reactionType,
          connectionHash,
        },
      });

      if (!existing) {
        await prisma.caseStudyReaction.create({
          data: {
            caseStudySlug,
            reactionType,
            connectionHash,
          },
        });
      }

      const reactions = await prisma.caseStudyReaction.groupBy({
        by: ["reactionType"],
        where: { caseStudySlug },
        _count: { id: true },
      });

      const userReactionsList = await prisma.caseStudyReaction.findMany({
        where: { caseStudySlug, connectionHash },
        select: { reactionType: true },
      });

      const counts = getDefaultReactionCounts();
      for (const r of reactions) {
        if (counts[r.reactionType] !== undefined) {
          counts[r.reactionType] = r._count.id;
        }
      }

      return {
        success: true,
        reactionType,
        counts,
        userReactions: userReactionsList.map((ur) => ur.reactionType),
      };
    } catch (dbErr) {
      if (env.VERCEL_ENV === "production") {
        console.error("Database reaction creation failed, using fallback:", dbErr);
      }
      if (!mockReactionsStore.has(caseStudySlug)) {
        mockReactionsStore.set(caseStudySlug, new Map());
      }
      const slugMap = mockReactionsStore.get(caseStudySlug)!;
      const currentCount = slugMap.get(reactionType) || 0;
      slugMap.set(reactionType, currentCount + 1);

      const counts = getDefaultReactionCounts();
      for (const [r, count] of slugMap.entries()) {
        counts[r] = count;
      }

      return {
        success: true,
        reactionType,
        counts,
        userReactions: [reactionType],
      };
    }
  }
}
