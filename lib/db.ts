import { Client, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/app/generated/prisma/client";
import ws from "ws";

// Configure Neon to use native 'ws' package inside Node.js environments (like Next.js build server)
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Parse connection string
const connectionString = process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const client = new Client(connectionString);
    const adapter = new PrismaNeon(client as unknown as ConstructorParameters<typeof PrismaNeon>[0]);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
