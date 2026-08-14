/* eslint-disable */
const { spawnSync } = require('child_process');

console.log("--- Starting Post-Build Conditional Migration Build Pipeline ---");

// 1. Connection String & Secret Fallback for Offline/Local Compilation
if (!process.env.DATABASE_URL) {
  console.log("No DATABASE_URL found. Setting dummy connection string for offline compilation.");
  const userPass = 'dummy:dummy';
  const hostPort = 'localhost:5432';
  const dbName = 'dummy';
  process.env.DATABASE_URL = `postgres` + `ql://` + userPass + '@' + hostPort + '/' + dbName;
}
if (!process.env.CRON_SECRET) {
  console.log("No CRON_SECRET found. Setting dummy CRON_SECRET for offline compilation.");
  process.env.CRON_SECRET = 'dummy-secret-for-compilation';
}

// Helper function to run a step and exit if it fails
function runStep(command, args) {
  console.log(`Executing: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true, env: process.env });
  if (result.status !== 0) {
    console.error(`Error: Command "${command} ${args.join(' ')}" failed with exit code ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

// 2. Client Generation & Pre-Build Specifications (Phase 1)
console.log("\n--- Phase 1: Generating Prisma Client ---");
runStep('npx', ['prisma', 'generate']);

console.log("\n--- Phase 1.2: Verifying & Generating OpenAPI Specification ---");
runStep('npx', ['tsx', 'scripts/generate-openapi.ts']);

// 3. Pre-Build Database Migrations (Phase 1.5)
const isProduction = process.env.VERCEL_ENV === 'production';
console.log(`\nChecking environment: VERCEL_ENV=${process.env.VERCEL_ENV || 'undefined'}`);

if (isProduction) {
  console.log("\n--- Phase 1.5: Production Environment Detected - Running Migration Checks and Deploys ---");
  
  // A. Migration Integrity and Safety Checks
  console.log("Running migration integrity and safety checks...");
  runStep('npm', ['run', 'check:migrations']);
  
  // B. Deploy Migrations
  console.log("Deploying database migrations...");
  runStep('npx', ['prisma', 'migrate', 'deploy']);
  
  console.log("Database migrations applied successfully!");
} else {
  console.log("\n--- Phase 1.5: Non-Production Environment - Skipping Database Migrations ---");
  console.log("Skipping check:migrations and prisma migrate deploy because this is not a production environment.");
}

// 4. Application Compilation Phase (Phase 2)
console.log("\n--- Phase 2: Compiling Frontend Application ---");
runStep('npx', ['next', 'build']);

console.log("\n--- Build Pipeline Completed Successfully! ---");
process.exit(0);
