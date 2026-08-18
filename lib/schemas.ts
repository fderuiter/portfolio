import { z } from "zod";

/**
 * Schema for telemetry POST payload validation
 */
export const TelemetryEventSchema = z.object({
  projectSlug: z.string().min(1, "projectSlug must be a non-empty string"),
  eventType: z.enum(["page_view", "project_click", "route_error"], {
    message: "Allowed: 'page_view', 'project_click', 'route_error'",
  }),
});

/**
 * Schema for sliding window rate limit parameters
 */
export const RateLimitParamsSchema = z.object({
  windowMs: z.number().int().positive().default(60000),
  maxRequests: z.number().int().positive().default(100),
});

/**
 * Schema for fallback secondary memory properties
 */
export const FallbackMemorySchema = z.object({
  redisUrl: z.string().url("Must be a valid redis connection URL").optional(),
  redisToken: z.string().min(1, "Redis token cannot be empty").optional(),
  ttlSeconds: z.number().int().positive().default(172800), // 48 hours
});

/**
 * Schema for background sync cron query parameters
 */
export const SyncParamsSchema = z.object({
  batch: z.coerce.number().int().positive("Batch must be a positive integer").max(500, "Batch cannot exceed 500").default(50),
});

/**
 * Schema for Case Study Summary item
 */
export const CaseStudySummarySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  primary_language: z.string().min(1),
  tags: z.array(z.string()),
});

/**
 * Schema for Case Study list response
 */
export const CaseStudyListResponseSchema = z.array(CaseStudySummarySchema);

/**
 * Allowed reaction types
 */
export const ALLOWED_REACTIONS = ["insightful", "mind_blowing", "actionable", "thorough"] as const;

/**
 * Schema for Feedback POST payload validation
 */
export const FeedbackSubmissionSchema = z.object({
  caseStudySlug: z.string().min(1, "caseStudySlug must be a non-empty string"),
  takeaways: z
    .array(z.string().min(1, "Takeaway cannot be empty"))
    .min(1, "At least one learning takeaway must be selected"),
  comments: z
    .string()
    .min(3, "Comments must be at least 3 characters long")
    .max(2000, "Comments cannot exceed 2000 characters"),
});

/**
 * Schema for Reaction POST payload validation
 */
export const ReactionSubmissionSchema = z.object({
  caseStudySlug: z.string().min(1, "caseStudySlug must be a non-empty string"),
  reactionType: z.enum(ALLOWED_REACTIONS, {
    message: "Allowed reactionType values: 'insightful', 'mind_blowing', 'actionable', 'thorough'",
  }),
});


