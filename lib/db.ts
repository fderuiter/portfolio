import { Client, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/app/generated/prisma/client";
import ws from "ws";

// Configure Neon to use native 'ws' package inside Node.js environments (like Next.js build server)
neonConfig.webSocketConstructor = ws;

// Parse connection string
const connectionString = process.env.DATABASE_URL;

let isHealthy = false;

const createPrismaClient = () => {
  const client = new Client(connectionString);
  const adapter = new PrismaNeon(client as unknown as ConstructorParameters<typeof PrismaNeon>[0]);
  const baseClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  return baseClient.$extends({
    query: {
      async $allOperations({ args, query }) {
        if (!isHealthy && process.env.SKIP_DB_HEALTH_CHECK !== "true") {
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

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
