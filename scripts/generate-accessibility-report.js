/* eslint-disable */
const fs = require('fs');
const path = require('path');

const resultsDir = path.join(__dirname, '../playwright-report/accessibility-results');
const summaryPath = path.join(__dirname, '../playwright-report/accessibility-summary.md');
const statusPath = path.join(__dirname, '../playwright-report/accessibility-status.txt');

// Ensure parent directories exist
fs.mkdirSync(path.dirname(summaryPath), { recursive: true });

let files = [];
try {
  if (fs.existsSync(resultsDir)) {
    files = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));
  }
} catch (e) {
  console.error('Error reading accessibility results:', e);
}

let totalChecked = 0;
let totalViolations = 0;
let results = [];
let allViolationsList = [];

files.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(resultsDir, file), 'utf8');
    const data = JSON.parse(content);
    totalChecked++;
    const vCount = data.violationsCount || 0;
    totalViolations += vCount;
    
    results.push({
      project: data.project,
      state: data.state,
      url: data.url,
      violationsCount: vCount,
      status: vCount === 0 ? '✅ Pass' : '❌ Fail'
    });

    if (vCount > 0) {
      data.violations.forEach(v => {
        allViolationsList.push({
          project: data.project,
          state: data.state,
          ...v
        });
      });
    }
  } catch (e) {
    console.error(`Error processing result file ${file}:`, e);
  }
});

// Determine overall status
const overallStatus = (totalChecked > 0 && totalViolations === 0) ? '✅ Pass' : '❌ Fail';
fs.writeFileSync(statusPath, overallStatus);

let markdown = `### ♿ Automated Accessibility Scan Report (Playwright-Axe)\n\n`;

if (totalChecked === 0) {
  markdown += `⚠️ **No accessibility results found.** Please ensure the accessibility test suite was executed.\n`;
} else {
  markdown += `**Summary**: Scanned **${totalChecked}** interactive UI states/scenarios across configured browsers.\n\n`;
  markdown += `| Project / Browser | Audited State | Status | Violations (Critical/Serious) |\n`;
  markdown += `| --- | --- | --- | --- |\n`;
  
  results.forEach(r => {
    markdown += `| **${r.project}** | ${r.state} | ${r.status} | ${r.violationsCount} |\n`;
  });
  
  markdown += `\n`;

  if (totalViolations === 0) {
    markdown += `🎉 **Zero critical or serious WCAG accessibility violations detected!**\n`;
  } else {
    markdown += `### 🚨 Detected Violations Details\n\n`;
    allViolationsList.forEach((v, idx) => {
      markdown += `#### ${idx + 1}. [${v.impact.toUpperCase()}] ${v.id} (${v.project} - ${v.state})\n`;
      markdown += `- **Description**: ${v.description}\n`;
      markdown += `- **Help**: ${v.help} ([Rule Reference](${v.helpUrl}))\n`;
      markdown += `- **Affected Elements**:\n`;
      
      v.nodes.forEach((node, nIdx) => {
        const cleanHtml = node.html ? node.html.trim().replace(/\n/g, ' ').replace(/`/g, '\\`') : '';
        markdown += `  - **Element ${nIdx + 1}**:\n`;
        markdown += `    - CSS Selector: \`${node.target.join(' > ')}\`\n`;
        markdown += `    - HTML Snippet: \`${cleanHtml}\`\n`;
      });
      markdown += `\n---\n\n`;
    });
  }
}

fs.writeFileSync(summaryPath, markdown);
console.log(`Successfully generated accessibility summary report at ${summaryPath}`);
console.log(`Accessibility status: ${overallStatus}`);
