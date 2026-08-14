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

    // The app polls telemetry, so networkidle is not a valid readiness signal.
    // Wait for every Pretext card to finish its deterministic measurement instead.
    await page.waitForFunction(() => {
      const elements = Array.from(document.querySelectorAll('.text-\\[9px\\]'));
      return elements.length > 0 && elements.every((el) => !el.textContent?.includes('MEASURING...'));
    });
    await page.waitForTimeout(500);
  });

  test('Audit: Default Landing Page State', async ({ page }, testInfo) => {
    const results = await new AxeBuilder({ page }).analyze();
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

    const results = await new AxeBuilder({ page }).analyze();
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
    // Wait for the dynamic CommandPalette client-side chunk to load and register the helper
    await page.waitForFunction(() => typeof (window as any).__openSearch === 'function', { timeout: 15000 });

    // Open Command Palette via global test handler
    await page.evaluate(() => {
      if (typeof (window as any).__openSearch === 'function') {
        (window as any).__openSearch();
      }
    });
    
    // Wait for the modal combobox to be visible
    const combobox = page.locator('[role="combobox"]');
    await expect(combobox).toBeVisible();

    // Take an initial scan of the opened command palette
    const results = await new AxeBuilder({ page }).analyze();
    const criticalSerious = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    // Also let's type inside search to trigger dynamic updates and audit that
    await combobox.fill('TypeScript');
    await page.waitForTimeout(300);

    const resultsFiltered = await new AxeBuilder({ page }).analyze();
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

  test('Audit: Command Palette Focus Restoration', async ({ page }, testInfo) => {
    // Navigate to a page with a calling button, like the 404 page
    await page.goto('/this-is-not-found');
    await page.waitForLoadState('networkidle');

    // Get the Search Site button
    const searchBtn = page.locator('button:has-text("Search Site")');
    await expect(searchBtn).toBeVisible();

    // Focus on the calling button
    await searchBtn.focus();
    await expect(searchBtn).toBeFocused();

    // Click the calling button to open the modal
    await searchBtn.click();

    // Wait for the modal combobox to be visible and focused
    const combobox = page.locator('[role="combobox"]');
    await expect(combobox).toBeVisible();
    await expect(combobox).toBeFocused();

    // Now run an accessibility scan on this state
    const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    const criticalSerious = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    // Close the command palette
    await page.keyboard.press('Escape');

    // Wait for the modal to be removed
    await expect(combobox).not.toBeVisible();

    // Verify keyboard focus returns to the calling button
    const isFocused = await searchBtn.evaluate(el => document.activeElement === el);
    expect(isFocused, "Keyboard focus did not return to the calling button when the modal closed").toBe(true);

    saveResult(testInfo.project.name, 'Command Palette Focus Restoration', criticalSerious, page.url());
  });

  test('Audit: Mobile Navigation Focus Trap', async ({ page }, testInfo) => {
    const isMobile = page.viewportSize()?.width && page.viewportSize()!.width < 768;
    if (!isMobile) {
      // Avoid failing desktop runs, but save empty violations so it's documented in metrics
      saveResult(testInfo.project.name, 'Mobile Navigation Focus Trap', [], page.url());
      return;
    }

    // Go to landing page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open mobile menu
    const menuTrigger = page.locator('[aria-label="Open navigation menu"]');
    await expect(menuTrigger).toBeVisible();
    await menuTrigger.click();

    // Wait for menu overlay to be visible
    const menuContainer = page.locator('#mobile-navigation');
    await expect(menuContainer).toBeVisible();

    // Wait for the automatic focus shift (100ms in code)
    await page.waitForTimeout(200);

    // Verify some element inside menu is currently focused
    const isFocusedInitiallyInside = await page.evaluate(() => {
      return !!document.activeElement?.closest('#mobile-navigation');
    });
    expect(isFocusedInitiallyInside).toBe(true);

    // Run Axe audit on the open mobile menu state
    const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    const criticalSerious = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    // Press Tab multiple times to verify focus is trapped within the mobile menu container
    let focusEscaped = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(() => {
        return !!document.activeElement?.closest('#mobile-navigation');
      });
      if (!inside) {
        focusEscaped = true;
        break;
      }
    }

    expect(focusEscaped, "Focus escaped the open menu container on mobile-sized viewport during Tab navigation").toBe(false);

    // Press Shift+Tab multiple times to verify focus is trapped within the mobile menu container
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Shift+Tab');
      const inside = await page.evaluate(() => {
        return !!document.activeElement?.closest('#mobile-navigation');
      });
      if (!inside) {
        focusEscaped = true;
        break;
      }
    }

    expect(focusEscaped, "Focus escaped the open menu container on mobile-sized viewport during Shift+Tab navigation").toBe(false);

    saveResult(testInfo.project.name, 'Mobile Navigation Focus Trap', criticalSerious, page.url());
  });
});
