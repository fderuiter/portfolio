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
 * Schema for Case Study submission POST payload validation
 */
export const CaseStudySubmissionSchema = z
  .object({
    title: z.string({ message: "Title is required" }).trim().min(1, "Title is required"),
    slug: z
      .string({ message: "Slug is required" })
      .trim()
      .min(1, "Slug is required")
      .regex(/^[a-zA-Z0-9-_]+$/, "Slug must contain only alphanumeric characters, hyphens, and underscores"),
    primary_language: z.string().trim().optional(),
    language: z.string().trim().optional(),
    editorial_content: z.string().trim().optional(),
    summary: z.string().trim().optional(),
    summary_markdown: z.string().trim().optional(),
    architectural_narrative: z.string().trim().optional(),
    narrative: z.string().trim().optional(),
    architectural_narrative_html: z.string().trim().optional(),
    tags: z.union([
      z.string().trim().min(1, "Tags are required"),
      z.array(z.string().trim().min(1, "Tag cannot be empty")).min(1, "At least one tag is required"),
    ], { message: "Tags are required" }),
    github_url: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const lang = data.primary_language || data.language;
    if (!lang) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Primary language is required",
        path: ["primary_language"],
      });
    }

    const ed = data.editorial_content || data.summary || data.summary_markdown;
    if (!ed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Summary / editorial content is required",
        path: ["editorial_content"],
      });
    }

    const arch = data.architectural_narrative || data.narrative || data.architectural_narrative_html;
    if (!arch) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Architectural narrative is required",
        path: ["architectural_narrative"],
      });
    }
  })
  .transform((data) => {
    const lang = data.primary_language || data.language || "";
    const ed = data.editorial_content || data.summary || data.summary_markdown || "";
    const arch = data.architectural_narrative || data.narrative || data.architectural_narrative_html || "";
    const tagsStr = Array.isArray(data.tags) ? data.tags.join(", ") : data.tags;

    return {
      title: data.title,
      slug: data.slug,
      primary_language: lang,
      editorial_content: ed,
      architectural_narrative: arch,
      tags: tagsStr,
      github_url: data.github_url || null,
    };
  });

