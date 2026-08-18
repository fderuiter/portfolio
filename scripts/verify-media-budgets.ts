import { inspectMediaBudgets } from "../lib/dx/media-guard";

function runMediaBudgetVerification() {
  console.log("--- Verifying Static Media Asset Budgets (public/) ---");
  const report = inspectMediaBudgets(process.cwd());

  console.log(`Scanned ${report.totalFiles} media asset(s). Total Aggregate Size: ${(report.totalBytes / (1024 * 1024)).toFixed(2)} MB`);

  if (report.violations.length > 0) {
    console.error("\n❌ Static Media Budget Violations Detected:");
    for (const v of report.violations) {
      console.error(`  • ${v}`);
    }
    process.exit(1);
  } else {
    console.log("✔ All static media assets pass individual and aggregate payload size budgets!");
    process.exit(0);
  }
}

runMediaBudgetVerification();
