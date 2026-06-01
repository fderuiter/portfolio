import fs from "fs";
import path from "path";
import https from "https";
import { env } from "../lib/env";

const VERCEL_API_URL = "https://api.vercel.com/v9/projects";

async function fetchVercelEnvKeys(projectId: string, token: string) {
  return new Promise<string[]>((resolve, reject) => {
    const req = https.request(
      `${VERCEL_API_URL}/${projectId}/env`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode !== 200) {
            reject(new Error(`Vercel API error: ${res.statusCode} ${data}`));
            return;
          }
          try {
            const json = JSON.parse(data);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const keys = json.envs.map((envObj: any) => envObj.key);
            resolve(Array.from(new Set(keys)) as string[]);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  const projectJsonPath = path.join(process.cwd(), ".vercel", "project.json");
  let projectId = "";
  
  if (fs.existsSync(projectJsonPath)) {
    const projectData = JSON.parse(fs.readFileSync(projectJsonPath, "utf-8"));
    projectId = projectData.projectId;
  } else {
    console.warn("⚠️ No Vercel project linked locally.");
    console.warn("Attempting to read Vercel project ID from VERCEL_PROJECT_ID env var...");
    projectId = env.VERCEL_PROJECT_ID || "";
  }

  if (!projectId) {
    console.error("❌ No Vercel project ID found. Run `npx vercel link` first or set VERCEL_PROJECT_ID.");
    process.exit(1);
  }

  let token = env.VERCEL_TOKEN;
  if (!token) {
    // Try to get from global vercel auth
    const globalVercelConfigPath = path.join(env.HOME || "", ".vercel", "auth.json");
    if (fs.existsSync(globalVercelConfigPath)) {
      const authData = JSON.parse(fs.readFileSync(globalVercelConfigPath, "utf-8"));
      token = authData.token;
    }
  }

  if (!token) {
    console.error("❌ No Vercel token found. Run `npx vercel login` or set VERCEL_TOKEN.");
    process.exit(1);
  }

  console.log("🔄 Pulling environment metadata from Vercel...");
  
  let vercelKeys: string[] = [];
  try {
    vercelKeys = await fetchVercelEnvKeys(projectId, token);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("❌ Failed to fetch environment metadata from Vercel:", err.message);
    process.exit(1);
  }

  // Local keys parsed by zod
  const localEnvKeys = Object.keys(env);
  
  const missingLocally = vercelKeys.filter(key => !localEnvKeys.includes(key));
  const onlyLocal = localEnvKeys.filter(key => !vercelKeys.includes(key) && key !== "NODE_ENV"); // NODE_ENV is standard

  let hasMismatch = false;

  if (missingLocally.length > 0) {
    console.warn("\n⚠️ The following variables are active in Vercel production but MISSING in your local schema (lib/env.ts):");
    missingLocally.forEach(k => console.warn(`   - ${k}`));
    hasMismatch = true;
  } else {
    console.log("\n✅ All Vercel production variables are covered by your local validation schema.");
  }

  if (onlyLocal.length > 0) {
    console.warn("\n⚠️ The following variables exist in your local schema but are MISSING in Vercel:");
    onlyLocal.forEach(k => console.warn(`   - ${k}`));
  }

  if (hasMismatch) {
    console.error("\n❌ Configuration drift detected! Please update lib/env.ts to include the missing variables.");
    process.exit(1);
  } else {
    console.log("\n🎉 Environment lifecycle sync complete. Local development is in sync with production truth.");
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
