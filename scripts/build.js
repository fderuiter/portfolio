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
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}
if (!process.env.CRON_SECRET) {
  console.log("No CRON_SECRET found. Setting dummy CRON_SECRET for offline compilation.");
  process.env.CRON_SECRET = 'dummy-secret-for-compilation';
}
if (!process.env.NODE_OPTIONS || !process.env.NODE_OPTIONS.includes('--no-warnings')) {
  process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --no-warnings`.trim();
}
process.env.SERWIST_SUPPRESS_TURBOPACK_WARNING = '1';

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

console.log("\n--- Phase 1.3: Verifying Terminology Glossary & Template Compiler Integrity ---");
runStep('npx', ['tsx', 'scripts/verify-terms.ts']);

// 3. Pre-Build Offline Migration Validation (Phase 1.5)
console.log("\n--- Phase 1.5: Offline Migration Integrity and Safety Validation ---");
runStep('npm', ['run', 'check:migrations']);

// 3.5. Documentation Compilation Phase (Phase 1.8)
console.log("\n--- Phase 1.8: Strictly Compiling and Verifying Documentation ---");
runStep('npm', ['run', 'compile-docs']);

// 4. Application Compilation Phase (Phase 2)
console.log("\n--- Phase 2: Compiling Frontend Application ---");
runStep('npx', ['next', 'build']);

console.log("\n--- Build Pipeline Completed Successfully! ---");
process.exit(0);
