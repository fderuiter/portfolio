import dotenv from "dotenv";
import fs from "fs";
import { defineConfig } from "prisma/config";

const isReplayMode =
  Boolean(process.env["MIGRATION_REPLAY_URL"]) ||
  Boolean(process.env["DISPOSABLE_DATABASE_URL"]) ||
  process.env["PRISMA_REPLAY_MODE"] === "true";

if (!isReplayMode) {
  if (fs.existsSync(".env.local")) {
    dotenv.config({ path: ".env.local" });
  } else {
    dotenv.config();
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url:
      process.env["MIGRATION_REPLAY_URL"] ||
      process.env["DISPOSABLE_DATABASE_URL"] ||
      process.env["DIRECT_URL"] ||
      process.env["DATABASE_URL"],
  },
});
