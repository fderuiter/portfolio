import dotenv from "dotenv";
import fs from "fs";
import { defineConfig } from "prisma/config";
import { env } from "./lib/env";

if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config();
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: env.DATABASE_URL,
  },
});
