import { z } from "zod";
import { validateConstructiveContent } from "@/lib/moderation";
import { CONTENT_PILLARS } from "@/lib/blog/types";

const BLOG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Runtime contract for a new, server-owned unpublished BlogPost draft. */
export const BlogDraftCreateSchema = z
  .object({
    title: z.string().trim().min(3).max(180),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(120)
      .regex(BLOG_SLUG_PATTERN, "Slug must be lowercase kebab-case"),
    dek: z.string().trim().min(10).max(500),
    body: z.string().trim().min(1).max(50_000),
    pillar: z.enum(CONTENT_PILLARS),
    tags: z.array(z.string().trim().min(1).max(50)).min(1).max(12),
    heroImageUrl: z.string().trim().url().max(2048).nullable().optional(),
  })
  .strict()
  .transform((data) => ({
    ...data,
    tags: data.tags.join(", "),
    hero_image_url: data.heroImageUrl || null,
  }));

/** Runtime contract for bounded, deterministic admin draft collection pagination. */
export const BlogDraftPaginationSchema = z
  .object({
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

/**
 * Schema for telemetry POST payload validation
 */
export const TelemetryEventSchema = z.object({
  projectSlug: z.string().min(1, "projectSlug must be a non-empty string"),
  eventType: z.enum(
    [
      "page_view",
      "project_click",
      "route_error",
      "simulator_option_select",
      "simulator_milestone_reached",
      "simulator_schedule_click",
      "simulator_report_copy",
    ],
    {
      message:
        "Allowed: 'page_view', 'project_click', 'route_error', 'simulator_option_select', 'simulator_milestone_reached', 'simulator_schedule_click', 'simulator_report_copy'",
    }
  ),
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
  batch: z.coerce
    .number()
    .int()
    .positive("Batch must be a positive integer")
    .max(500, "Batch cannot exceed 500")
    .default(50),
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
    title: z
      .string({ message: "Title is required" })
      .trim()
      .min(1, "Title is required"),
    slug: z
      .string({ message: "Slug is required" })
      .trim()
      .min(1, "Slug is required")
      .regex(
        /^[a-zA-Z0-9-_]+$/,
        "Slug must contain only alphanumeric characters, hyphens, and underscores"
      ),
    primary_language: z.string().trim().optional(),
    language: z.string().trim().optional(),
    editorial_content: z.string().trim().optional(),
    summary: z.string().trim().optional(),
    summary_markdown: z.string().trim().optional(),
    architectural_narrative: z.string().trim().optional(),
    narrative: z.string().trim().optional(),
    architectural_narrative_html: z.string().trim().optional(),
    tags: z.union(
      [
        z.string().trim().min(1, "Tags are required"),
        z
          .array(z.string().trim().min(1, "Tag cannot be empty"))
          .min(1, "At least one tag is required"),
      ],
      { message: "Tags are required" }
    ),
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

    const arch =
      data.architectural_narrative ||
      data.narrative ||
      data.architectural_narrative_html;
    if (!arch) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Architectural narrative is required",
        path: ["architectural_narrative"],
      });
    }

    // Content Moderation & Tone Validation
    if (data.title) {
      const check = validateConstructiveContent(data.title);
      if (!check.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: check.reason || "Title violates community tone standards",
          path: ["title"],
        });
      }
    }

    if (ed) {
      const check = validateConstructiveContent(ed);
      if (!check.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: check.reason || "Summary violates community tone standards",
          path: ["editorial_content"],
        });
      }
    }

    if (arch) {
      const check = validateConstructiveContent(arch);
      if (!check.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            check.reason ||
            "Architectural narrative violates community tone standards",
          path: ["architectural_narrative"],
        });
      }
    }

    const tagsStr = Array.isArray(data.tags) ? data.tags.join(" ") : data.tags;
    if (tagsStr) {
      const check = validateConstructiveContent(tagsStr);
      if (!check.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: check.reason || "Tags violate community tone standards",
          path: ["tags"],
        });
      }
    }
  })
  .transform((data) => {
    const lang = data.primary_language || data.language || "";
    const ed =
      data.editorial_content || data.summary || data.summary_markdown || "";
    const arch =
      data.architectural_narrative ||
      data.narrative ||
      data.architectural_narrative_html ||
      "";
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

/**
 * Allowed reaction types
 */
export const ALLOWED_REACTIONS = [
  "insightful",
  "mind_blowing",
  "actionable",
  "thorough",
] as const;

/**
 * Schema for Feedback POST payload validation
 */
export const FeedbackSubmissionSchema = z
  .object({
    caseStudySlug: z
      .string()
      .min(1, "caseStudySlug must be a non-empty string"),
    takeaways: z
      .array(z.string().min(1, "Takeaway cannot be empty"))
      .min(1, "At least one learning takeaway must be selected"),
    comments: z
      .string()
      .min(3, "Comments must be at least 3 characters long")
      .max(2000, "Comments cannot exceed 2000 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.comments) {
      const commentsCheck = validateConstructiveContent(data.comments);
      if (!commentsCheck.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            commentsCheck.reason ||
            "Submission text violates community tone standards",
          path: ["comments"],
        });
      }
    }

    if (Array.isArray(data.takeaways)) {
      data.takeaways.forEach((takeaway, idx) => {
        const takeawayCheck = validateConstructiveContent(takeaway);
        if (!takeawayCheck.isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              takeawayCheck.reason ||
              "Submission text violates community tone standards",
            path: ["takeaways", idx],
          });
        }
      });
    }
  });

/**
 * Schema for Reaction POST payload validation
 */
export const ReactionSubmissionSchema = z.object({
  caseStudySlug: z.string().min(1, "caseStudySlug must be a non-empty string"),
  reactionType: z.enum(ALLOWED_REACTIONS, {
    message:
      "Allowed reactionType values: 'insightful', 'mind_blowing', 'actionable', 'thorough'",
  }),
});

/**
 * Allowed intent categories for visitor contact submissions
 */
export const CONTACT_INTENTS = [
  "general",
  "collaboration",
  "consulting",
  "recruiting",
  "other",
] as const;
export type ContactIntent = (typeof CONTACT_INTENTS)[number];

/**
 * Schema for Contact submission POST payload validation
 */
export const ContactSubmissionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),
    email: z.string().trim().email("Please provide a valid email address"),
    intent: z
      .enum(CONTACT_INTENTS, {
        message:
          "Intent must be one of: 'general', 'collaboration', 'consulting', 'recruiting', 'other'",
      })
      .default("general"),
    subject: z
      .string()
      .trim()
      .min(3, "Subject must be at least 3 characters")
      .max(150, "Subject cannot exceed 150 characters"),
    message: z
      .string()
      .trim()
      .min(10, "Message must be at least 10 characters")
      .max(5000, "Message cannot exceed 5000 characters"),
    _gotcha: z.string().optional(),
    _clientTimestamp: z.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.name) {
      const check = validateConstructiveContent(data.name);
      if (!check.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: check.reason || "Name violates community tone standards",
          path: ["name"],
        });
      }
    }

    if (data.subject) {
      const check = validateConstructiveContent(data.subject);
      if (!check.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: check.reason || "Subject violates community tone standards",
          path: ["subject"],
        });
      }
    }

    if (data.message) {
      const check = validateConstructiveContent(data.message);
      if (!check.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: check.reason || "Message violates community tone standards",
          path: ["message"],
        });
      }
    }
  });

export type ContactSubmission = z.infer<typeof ContactSubmissionSchema>;

/**
 * Schema for Contact submission API response
 */
export const ContactResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  messageId: z.string().optional(),
  simulated: z.boolean().optional(),
});

export type ContactResponse = z.infer<typeof ContactResponseSchema>;

/**
 * Schema for Newsletter subscription POST payload validation
 */
export const NewsletterSubscriptionSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  _gotcha: z.string().optional(),
  _clientTimestamp: z.number().int().positive().optional(),
});

export type NewsletterSubscription = z.infer<
  typeof NewsletterSubscriptionSchema
>;

/**
 * Schema for Newsletter subscription API response
 */
export const NewsletterResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  subscriberId: z.string().optional(),
  simulated: z.boolean().optional(),
});

export type NewsletterResponse = z.infer<typeof NewsletterResponseSchema>;

/**
 * Allowed Resend webhook lifecycle event types
 */
export const RESEND_EVENT_TYPES = [
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.complained",
  "email.bounced",
  "email.opened",
  "email.clicked",
] as const;

export type ResendEventType = (typeof RESEND_EVENT_TYPES)[number];

/**
 * Schema for Resend Webhook POST payload validation
 */
export const ResendWebhookEventSchema = z.object({
  type: z.enum(RESEND_EVENT_TYPES, {
    message: "Invalid or unsupported Resend event type",
  }),
  created_at: z.string().optional(),
  data: z
    .object({
      id: z.string().optional(),
      from: z.string().optional(),
      to: z.array(z.string()).optional(),
      subject: z.string().optional(),
      created_at: z.string().optional(),
      status: z.string().optional(),
      bounce: z
        .object({
          message: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),
    })
    .passthrough(),
});

export type ResendWebhookEvent = z.infer<typeof ResendWebhookEventSchema>;

/**
 * Schema for Resend Webhook response
 */
export const ResendWebhookResponseSchema = z.object({
  received: z.boolean(),
  processedEvent: z.string().optional(),
  suppressed: z.boolean().optional(),
});

export type ResendWebhookResponse = z.infer<typeof ResendWebhookResponseSchema>;
