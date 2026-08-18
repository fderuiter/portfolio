import { inspectMediaBudgets } from "../lib/media-budget";

console.log("--- Executing Static Media Budget Verification ---");

const workspaceRoot = process.cwd();
const report = inspectMediaBudgets(workspaceRoot);

if (!report.passesBudget) {
  console.error("\n❌ STATIC MEDIA BUDGET BREACH DETECTED!\n");
  for (const violation of report.violations) {
    console.error(`  • ${violation}`);
  }
  console.error(`\nScanned ${report.scannedFilesCount} media assets (${(report.totalSizeBytes / (1024 * 1024)).toFixed(2)} MB total).`);
  console.error("Failing build due to static media budget policy violations.\n");
  process.exit(1);
}

console.log(`\n✔ Static Media Budget Check Passed (${report.scannedFilesCount} media assets, ${(report.totalSizeBytes / (1024 * 1024)).toFixed(2)} MB total).`);
process.exit(0);
