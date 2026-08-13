/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

// Helper to save scan results to JSON files
function saveResult(projectName: string, stateName: string, violations: any[], checkedUrl: string) {
  const dir = path.join(__dirname, '../../playwright-report/accessibility-results');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const safeStateName = stateName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${projectName}-${safeStateName}.json`;
  const filePath = path.join(dir, filename);
  
  const resultData = {
    project: projectName,
    state: stateName,
    url: checkedUrl,
    violationsCount: violations.length,
    violations: violations.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n: any) => ({
        target: n.target,
        html: n.html
      }))
    })),
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(filePath, JSON.stringify(resultData, null, 2));
}

// Helper to format failure messages clearly in terminal logs
function formatViolationsForLog(projectName: string, stateName: string, violations: any[]): string {
  if (violations.length === 0) return '';
  let log = `\n==================================================\n`;
  log += `🚨 ACCESSIBILITY VIOLATIONS DETECTED (${projectName} - ${stateName})\n`;
  log += `Found ${violations.length} critical or serious violations.\n`;
  log += `==================================================\n\n`;

  violations.forEach((violation, idx) => {
    log += `Violation #${idx + 1}:\n`;
    log += `  Rule ID:     ${violation.id}\n`;
    log += `  Severity:    ${violation.impact}\n`;
    log += `  Description: ${violation.description}\n`;
    log += `  Help:        ${violation.help}\n`;
    log += `  Help URL:    ${violation.helpUrl}\n`;
    log += `  Affected Elements:\n`;
    violation.nodes.forEach((node: any, nIdx: number) => {
      log += `    Element ${nIdx + 1}:\n`;
      log += `      CSS Selector: ${node.target.join(' > ')}\n`;
      log += `      HTML snippet: ${node.html}\n`;
    });
    log += `--------------------------------------------------\n\n`;
  });
  return log;
}

test.describe('Accessibility Audit Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Emulate reduced motion to disable JS transitions/animations
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Inject the global flag for the client so components enable specific testing behaviors if needed
    await page.addInitScript(() => {
      (window as unknown as { __PLAYWRIGHT_TEST__?: boolean }).__PLAYWRIGHT_TEST__ = true;
    });

    // Go to landing page
    await page.goto('/');

    // Disable animations for consistent layout scanning
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          transition: none !important;
          animation: none !important;
        }
      `
    });

    // Wait for network idle
    await page.waitForLoadState('networkidle');

    // Wait for the Pretext measuring text to finish
    await page.waitForFunction(() => {
      return document.querySelector('.text-\\[9px\\]') && !document.querySelector('.text-\\[9px\\]')?.textContent?.includes('MEASURING...');
    });
  });

  test('Audit: Default Landing Page State', async ({ page }, testInfo) => {
    const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    const criticalSerious = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    saveResult(testInfo.project.name, 'Default Page State', criticalSerious, page.url());

    if (criticalSerious.length > 0) {
      const errorLog = formatViolationsForLog(testInfo.project.name, 'Default Page State', criticalSerious);
      console.error(errorLog);
    }

    expect(criticalSerious.length, `Found ${criticalSerious.length} critical/serious accessibility violations in Default Page State`).toBe(0);
  });

  test('Audit: Interactive Project Filtering Tab State', async ({ page }, testInfo) => {
    // Find and click the TypeScript button
    const filterBtn = page.locator('button:has-text("TypeScript")');
    await filterBtn.click();
    
    // Brief timeout to let masonry state transition complete
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    const criticalSerious = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    saveResult(testInfo.project.name, 'Interactive State: TypeScript Filter', criticalSerious, page.url());

    if (criticalSerious.length > 0) {
      const errorLog = formatViolationsForLog(testInfo.project.name, 'Interactive State: TypeScript Filter', criticalSerious);
      console.error(errorLog);
    }

    expect(criticalSerious.length, `Found ${criticalSerious.length} critical/serious accessibility violations after TypeScript filtering`).toBe(0);
  });

  test('Audit: Active Command Palette Search State', async ({ page }, testInfo) => {
    // Ensure the page has active focus outside any keyboard boundaries
    await page.click('text=FDERUITER');
    await page.waitForTimeout(500);

    // Open Command Palette via Ctrl+K shortcut
    await page.keyboard.press('Control+k');
    
    // Wait for the modal combobox to be visible
    const combobox = page.locator('[role="combobox"]');
    
    // Fallback: if not open, dispatch on window
    try {
      await expect(combobox).toBeVisible({ timeout: 2000 });
    } catch {
      await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })));
      await expect(combobox).toBeVisible();
    }

    // Take an initial scan of the opened command palette
    const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    const criticalSerious = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    // Also let's type inside search to trigger dynamic updates and audit that
    await combobox.fill('TypeScript');
    await page.waitForTimeout(300);

    const resultsFiltered = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    const criticalSeriousFiltered = resultsFiltered.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    // Merge violations found in both search states
    const mergedViolationsMap = new Map<string, any>();
    [...criticalSerious, ...criticalSeriousFiltered].forEach(v => {
      mergedViolationsMap.set(v.id, v);
    });
    const combinedCriticalSerious = Array.from(mergedViolationsMap.values());

    saveResult(testInfo.project.name, 'Interactive State: Active Command Palette', combinedCriticalSerious, page.url());

    if (combinedCriticalSerious.length > 0) {
      const errorLog = formatViolationsForLog(testInfo.project.name, 'Interactive State: Active Command Palette', combinedCriticalSerious);
      console.error(errorLog);
    }

    expect(combinedCriticalSerious.length, `Found ${combinedCriticalSerious.length} critical/serious accessibility violations in Active Command Palette State`).toBe(0);
  });
});
