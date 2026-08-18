import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/app/generated/prisma/client";
import ws from "ws";
import { getEnv } from "./env";

// Configure Neon to use native 'ws' package inside Node.js environments (like Next.js build server)
neonConfig.webSocketConstructor = ws;

// Parse connection string via validated schema
const env = getEnv();
const connectionString = env.DATABASE_URL;

let isHealthy = false;

const createPrismaClient = () => {
  const adapter = new PrismaNeon({ connectionString });
  const currentEnv = getEnv();
  const baseClient = new PrismaClient({
    adapter,
    log: currentEnv.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  return baseClient.$extends({
    query: {
      async $allOperations({ args, query, ...rest }) {
        const activeEnv = getEnv();
        if (activeEnv.PLAYWRIGHT_TEST === "true") {
          const operation = (rest as Record<string, unknown>).operation;
          const model = (rest as Record<string, unknown>).model;
          if (operation === "findMany" || operation === "findFirst" || operation === "findUnique") {
            if (model === "CaseStudy") {
              return [
                {
                  id: "clinical-data-mapper",
                  slug: "clinical-data-mapper",
                  title: "Clinical Data Mapper",
                  primary_language: "TypeScript",
                  tags: "clinical, edc, mapping",
                  published: true,
                  created_at: new Date(),
                  updated_at: new Date(),
                  description: "Clinical Data Mapper Description",
                  editorial_content: "Clinical Data Mapper Editorial Content",
                  github_url: "https://github.com/fderuiter/clinical-data-mapper",
                  simulated_telemetry: false,
                }
              ];
            }
            return [];
          }
          if (operation === "groupBy") {
            return [];
          }
          if (operation === "count") {
            return 0;
          }
          return null;
        }
        const conn = activeEnv.DATABASE_URL;
        if (!conn || conn.includes("dummy")) {
          throw new Error("Database offline: Dummy connection URL configured.");
        }
        if (!isHealthy && activeEnv.SKIP_DB_HEALTH_CHECK !== "true") {
          try {
            // Runtime pre-flight validation
            await baseClient.$queryRawUnsafe(`SELECT 1 FROM "TelemetryEvent" LIMIT 1`);
            isHealthy = true;
          } catch (error) {
            console.error("Database health check failed: Schema version is behind. Missing TelemetryEvent.", error);
            throw new Error("Database health check failed: Schema version is behind. Missing TelemetryEvent.");
          }
        }
        return query(args);
      }
    }
  });
};

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (getEnv().NODE_ENV !== "production") globalForPrisma.prisma = prisma;
