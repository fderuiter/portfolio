import esbuild from "esbuild";
import fs from "fs";
import path from "path";

const workspaceRoot = path.resolve(__dirname, "..");
const entryPoint = path.join(workspaceRoot, "lib", "garmin-engine.ts");
const outputFiles = [
  path.join(workspaceRoot, "public", "garmin-engine.js"),
  path.join(workspaceRoot, "public", "monkey-c-mayhem.js"),
];

const MAX_SIZE_BYTES = 50 * 1024; // Strict 50KB size budget limit

export async function buildStandaloneEngine() {
  console.log("--- Phase: Compiling Standalone Vanilla JS Engine Asset ---");

  await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    minify: true,
    format: "iife",
    globalName: "GarminEngine",
    target: ["es2020"],
    outfile: outputFiles[0],
  });

  // Copy primary bundle to secondary alias name for branding consistency
  fs.copyFileSync(outputFiles[0], outputFiles[1]);

  for (const outputFile of outputFiles) {
    if (!fs.existsSync(outputFile)) {
      throw new Error(`[BUILD ERROR] Expected standalone JS file was not generated: ${outputFile}`);
    }

    const stats = fs.statSync(outputFile);
    const sizeKb = (stats.size / 1024).toFixed(2);
    const fileName = path.basename(outputFile);

    console.log(`✓ Standalone Engine Asset Generated: ${fileName} (${sizeKb} KB / ${stats.size} bytes)`);

    if (stats.size > MAX_SIZE_BYTES) {
      const errorMsg = `[BUILD ERROR] Standalone JavaScript artifact '${fileName}' (${sizeKb} KB) exceeds maximum size budget of 50.0 KB (${MAX_SIZE_BYTES} bytes)!`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  console.log("--- Standalone Engine Build & Size Check Passed (<= 50KB Budget Verified) ---");
}

if (require.main === module || (process.argv[1] && process.argv[1].includes("build-standalone-engine"))) {
  buildStandaloneEngine().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
