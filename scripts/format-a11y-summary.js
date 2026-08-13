/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const metricsPath = path.join(__dirname, '../test-results/accessibility-metrics.json');
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

if (!fs.existsSync(metricsPath)) {
  console.log('No accessibility metrics file found.');
  process.exit(0);
}

try {
  const data = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  let markdown = '\n\n## ♿ Automated Accessibility Audit Metrics\n\n';

  // 1. Static/Dynamic Compliance Scans Table
  markdown += '### 🔍 Compliance Scans (Level AA)\n\n';
  markdown += '| State / Page Checked | Viewport / Device | Passes | Violations | Status |\n';
  markdown += '| --- | --- | --- | --- | --- |\n';
  if (data.scans && data.scans.length > 0) {
    data.scans.forEach(scan => {
      const statusIcon = scan.status === 'passed' ? '✅ Pass' : '❌ Fail';
      markdown += `| ${scan.name} | \`${scan.viewport}\` | ${scan.passes} | ${scan.violations} | ${statusIcon} |\n`;
    });
  } else {
    markdown += '| No scans executed | - | - | - | - |\n';
  }

  // 2. Focus Trap / Interactive Mechanics Table
  markdown += '\n### 🔄 Focus Trap & Keyboard Navigation Mechanics\n\n';
  markdown += '| Interactive Component | Viewport / Device | Details | Status |\n';
  markdown += '| --- | --- | --- | --- |\n';
  if (data.focusTraps && data.focusTraps.length > 0) {
    data.focusTraps.forEach(trap => {
      const statusIcon = trap.status === 'passed' ? '✅ Pass' : '❌ Fail';
      markdown += `| ${trap.component} | \`${trap.viewport}\` | ${trap.details} | ${statusIcon} |\n`;
    });
  } else {
    markdown += '| No focus trap validations executed | - | - | - |\n';
  }

  markdown += '\n';

  if (summaryPath) {
    fs.appendFileSync(summaryPath, markdown);
    console.log('Successfully appended accessibility metrics to GITHUB_STEP_SUMMARY.');
  } else {
    console.log('No GITHUB_STEP_SUMMARY environment variable. Markdown output:\n', markdown);
  }
} catch (error) {
  console.error('Failed to parse accessibility metrics or write summary:', error);
}
