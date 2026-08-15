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

