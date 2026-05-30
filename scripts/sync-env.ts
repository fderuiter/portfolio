import fs from "fs";
import path from "path";
import https from "https";

const VERCEL_API_URL = "https://api.vercel.com";

async function fetchVercelEnvMetadata(projectId: string, token: string) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `${VERCEL_API_URL}/v9/projects/${projectId}/env`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode !== 200) {
            reject(new Error(`Failed to fetch from Vercel: ${res.statusCode} ${data}`));
            return;
          }
          resolve(JSON.parse(data));
        });
      }
    );
    req.on("error", reject);
  });
}

async function main() {
  console.log("🔄 Starting Automated Lifecycle Sync with Vercel...");
  
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  const localEnvPath = path.join(process.cwd(), ".env");
  let localKeys: string[] = [];
  if (fs.existsSync(localEnvPath)) {
    const content = fs.readFileSync(localEnvPath, "utf8");
    localKeys = content.split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#"))
      .map(line => line.split("=")[0]);
  } else {
    console.warn("⚠️ No .env file found locally. Please create one to prevent missing required keys.");
  }

  if (!token || !projectId) {
    console.warn("⚠️ VERCEL_TOKEN or VERCEL_PROJECT_ID not set. Skipping remote Vercel check.");
    process.exit(0);
  }

  try {
    const data = await fetchVercelEnvMetadata(projectId, token) as { envs?: { key: string }[] };
    const envs = data.envs || [];
    // Only extract keys (metadata) to ensure "Security First" requirement.
    const remoteKeys = envs.map(e => e.key);

    console.log(`✅ Pulled ${remoteKeys.length} environment variable keys from Vercel metadata.`);

    const missingLocal = remoteKeys.filter(k => !localKeys.includes(k));
    if (missingLocal.length > 0) {
      console.error(`❌ Mismatch detected! Missing variables locally: ${missingLocal.join(", ")}`);
      process.exit(1);
    } else {
      console.log("✅ Local environment is synchronized with Vercel.");
    }
  } catch (err: unknown) {
    console.error(`❌ Sync failed: ${(err as Error).message}`);
    process.exit(1);
  }
}

main();
