import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  SKIP_DB_HEALTH_CHECK: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  ALLOW_DESTRUCTIVE_MIGRATIONS: z.string().optional(),
  CI: z.string().optional(),
  PLAYWRIGHT_TEST: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  NEXT_RUNTIME: z.enum(["nodejs", "edge"]).optional(),

  // Cloud/Vercel Metadata (Sync metadata requirements)
  VERCEL_URL: z.string().optional(),
  VERCEL_ENV: z.string().optional(),
  VERCEL_REGION: z.string().optional(),
  VERCEL_BRANCH_URL: z.string().optional(),
  VERCEL_PROJECT_ID: z.string().optional(),
  VERCEL_TOKEN: z.string().optional(),
  HOME: z.string().optional(),
});

const clientSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

const isServer = typeof window === "undefined";

const fullSchema = serverSchema.merge(clientSchema);

export type EnvSchemaType = z.infer<typeof fullSchema>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends EnvSchemaType {}
  }
}

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  SKIP_DB_HEALTH_CHECK: process.env.SKIP_DB_HEALTH_CHECK,
  CRON_SECRET: process.env.CRON_SECRET,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  ALLOW_DESTRUCTIVE_MIGRATIONS: process.env.ALLOW_DESTRUCTIVE_MIGRATIONS,
  CI: process.env.CI,
  PLAYWRIGHT_TEST: process.env.PLAYWRIGHT_TEST,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  NEXT_RUNTIME: process.env.NEXT_RUNTIME,
  
  VERCEL_URL: process.env.VERCEL_URL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_REGION: process.env.VERCEL_REGION,
  VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
  VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
  VERCEL_TOKEN: process.env.VERCEL_TOKEN,
  HOME: process.env.HOME,

  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
};

const parsed = (isServer ? fullSchema : clientSchema).safeParse(processEnv);

if (!parsed.success) {
  if (process.env.SKIP_ENV_VALIDATION !== "true") {
    console.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
    throw new Error("Invalid environment variables");
  } else {
    console.warn("⚠️ Skipping environment variable validation.");
  }
}

export const env = (parsed.success ? parsed.data : processEnv) as EnvSchemaType;
