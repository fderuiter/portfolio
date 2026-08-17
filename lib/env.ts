import { z } from "zod";

/**
 * Server-side environment variables schema.
 * Secret keys that must never be exposed to the browser.
 */
export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),
  PGHOST: z.string().optional(),
  PGHOST_UNPOOLED: z.string().optional(),
  PGUSER: z.string().optional(),
  PGDATABASE: z.string().optional(),
  PGPASSWORD: z.string().optional(),
  POSTGRES_URL: z.string().optional(),
  POSTGRES_URL_NON_POOLING: z.string().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_HOST: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DATABASE: z.string().optional(),
  POSTGRES_URL_NO_SSL: z.string().optional(),
  POSTGRES_PRISMA_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),
  GITHUB_TOKEN: z.string().min(1).optional(),
  SENTRY_DSN: z.string().url().optional(),
});

/**
 * Client-side environment variables schema (prefixed with NEXT_PUBLIC_).
 * Safe to be bundled and exposed in the browser.
 */
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type AppEnv = ServerEnv & ClientEnv;

/**
 * Validate and parse environment variables against the defined schemas.
 * Returns parsed object and validation issues (if any).
 */
export function validateEnv(rawEnv: Record<string, string | undefined> = process.env): {
  success: boolean;
  data: AppEnv;
  errors: Record<string, string[]>;
} {
  const serverResult = serverEnvSchema.safeParse(rawEnv);
  const clientResult = clientEnvSchema.safeParse(rawEnv);

  const errors: Record<string, string[]> = {};

  if (!serverResult.success) {
    for (const issue of serverResult.error.issues) {
      const key = issue.path.join(".");
      errors[key] = errors[key] || [];
      errors[key].push(issue.message);
    }
  }

  if (!clientResult.success) {
    for (const issue of clientResult.error.issues) {
      const key = issue.path.join(".");
      errors[key] = errors[key] || [];
      errors[key].push(issue.message);
    }
  }

  const data = {
    ...(serverResult.success ? serverResult.data : ({} as ServerEnv)),
    ...(clientResult.success ? clientResult.data : ({} as ClientEnv)),
  } as AppEnv;

  return {
    success: serverResult.success && clientResult.success,
    data,
    errors,
  };
}

let cachedEnv: AppEnv | null = null;

/**
 * Get validated application environment object.
 * In development / production, logs formatted warnings if schema validation fails.
 */
export function getEnv(): AppEnv {
  if (cachedEnv && process.env.NODE_ENV !== "test") return cachedEnv;

  const result = validateEnv(process.env);
  if (!result.success && process.env.NODE_ENV !== "test") {
    console.warn("⚠️ [ENV VALIDATION WARNING] Environment schema issues detected:", result.errors);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

/**
 * Centered dynamic helper to check if current deployment is production.
 * Uses the existing environment validation schema to prevent unvalidated configurations.
 */
export function isProductionEnvironment(): boolean {
  const currentEnv = getEnv();
  return currentEnv.VERCEL_ENV === "production";
}

export const env = getEnv();
