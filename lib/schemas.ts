import { z } from "zod";

/**
 * Schema for telemetry POST payload validation
 */
export const TelemetryEventSchema = z.object({
  projectSlug: z.string().min(1, "projectSlug must be a non-empty string"),
  eventType: z.enum(["page_view", "project_click", "route_error", "contact_click", "simulator_milestone"], {
    message: "Allowed: 'page_view', 'project_click', 'route_error', 'contact_click', 'simulator_milestone'",
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
 * Schema for transparency logs list query parameters
 */
export const TransparencyLogsParamsSchema = z.object({
  sort: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive("Page must be a positive integer").default(1),
  limit: z.coerce.number().int().positive("Limit must be a positive integer").max(100, "Limit cannot exceed 100").default(20),
});
