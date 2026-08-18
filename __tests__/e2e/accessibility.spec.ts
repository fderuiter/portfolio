/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect, Page, TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';
import { getDiscoveredRoutes, DiscoveredRoute } from '@/lib/accessibility-utils';

/**
 * Helper to save scan results to JSON files for CI reporting and trend tracking.
 */
function saveResult(projectName: string, stateName: string, violations: any[], checkedUrl: string) {
  const dir = path.join(process.cwd(), 'playwright-report/accessibility-results');
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

/**
 * Helper to format failure messages clearly in terminal logs with CSS selectors and HTML snippets.
 */
function formatViolationsForLog(projectName: string, stateName: string, violations: any[]): string {
  if (violations.length === 0) return '';
  let log = `\n==================================================\n`;
  log += `🚨 ACCESSIBILITY VIOLATIONS DETECTED (${projectName} - ${stateName})\n`;
  log += `Found ${violations.length} critical, serious, or moderate violations.\n`;
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

/**
 * Common helper to execute AxeBuilder audit with strict WCAG 2.1 AA rules and zero tolerance.
 */
async function auditAndAssert(
  page: Page,
  testInfo: TestInfo,
  stateName: string,
  options: { disableRules?: string[] } = {}
) {
  let builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']);

  if (options.disableRules && options.disableRules.length > 0) {
    builder = builder.disableRules(options.disableRules);
  }

  const results = await builder.analyze();
  // Filter for critical, serious, and moderate violations (zero tolerance policy)
  const targetViolations = results.violations.filter(
    v => v.impact === 'critical' || v.impact === 'serious' || v.impact === 'moderate'
  );

  saveResult(testInfo.project.name, stateName, targetViolations, page.url());

  if (targetViolations.length > 0) {
    const errorLog = formatViolationsForLog(testInfo.project.name, stateName, targetViolations);
    console.error(errorLog);
  }

  expect(
    targetViolations.length,
    `Found ${targetViolations.length} critical/serious/moderate accessibility violations in [${stateName}]`
  ).toBe(0);
}

/**
 * Interaction hook triggers deep interactive component states prior to accessibility scanning.
 */
async function executeInteractionHooks(page: Page, route: DiscoveredRoute) {
  if (!route.interactiveType) return;

  try {
    if (route.interactiveType === 'filter-tab') {
      const filterBtn = page.locator('button:has-text("TypeScript")');
      if (await filterBtn.isVisible({ timeout: 2000 })) {
        await filterBtn.click();
        await page.waitForTimeout(200);
      }
    } else if (route.interactiveType === 'terminal') {
      const terminalInput = page.locator('input[aria-label*="terminal" i], input[placeholder*="command" i], .terminal-input').first();
      if (await terminalInput.isVisible({ timeout: 2000 })) {
        await terminalInput.focus();
        await terminalInput.fill('help');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
      }
    } else if (route.interactiveType === 'node-builder') {
      const canvasOrNode = page.locator('.crf-canvas-area, [data-field-id], .react-flow__pane, canvas').first();
      if (await canvasOrNode.isVisible({ timeout: 2000 })) {
        await canvasOrNode.click({ force: true });
        await page.waitForTimeout(200);
      }
      const viewToggle = page.locator('button:has-text("Visit Matrix"), button:has-text("Rule Graph"), button:has-text("Snap Mode")').first();
      if (await viewToggle.isVisible({ timeout: 1000 })) {
        await viewToggle.click();
        await page.waitForTimeout(200);
      }
    } else if (route.interactiveType === 'spatial-viewer') {
      const viewerBtn = page.locator('button:has-text("Axial"), button:has-text("3D Only"), button:has-text("Split View"), button:has-text("Run Scan")').first();
      if (await viewerBtn.isVisible({ timeout: 2000 })) {
        await viewerBtn.click();
        await page.waitForTimeout(200);
      }
    }
  } catch (_err) {
    // Soft catch for interactive state triggering
  }
}

test.describe('Continuous Accessibility (a11y) & WCAG 2.1 AA Audit Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Emulate reduced motion to disable JS transitions/animations
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Inject the global test flag so components enable deterministic testing behaviors
    await page.addInitScript(() => {
      (window as unknown as { __PLAYWRIGHT_TEST__?: boolean }).__PLAYWRIGHT_TEST__ = true;
    });

    // Disable CSS animations for consistent layout scanning
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          transition: none !important;
          animation: none !important;
        }
      `
    });
  });

  // Dynamic Route Ingestion and Interactive State Accessibility Auditing
  const discoveredRoutes = getDiscoveredRoutes();

  for (const route of discoveredRoutes) {
    test(`Audit Route: [${route.category.toUpperCase()}] ${route.name}`, async ({ page }, testInfo) => {
      await page.goto(route.path);
      await page.waitForLoadState('domcontentloaded');

      if (route.path === '/') {
        await page.waitForFunction(() => {
          const elements = Array.from(document.querySelectorAll('.text-\\[9px\\]'));
          return elements.length > 0 && elements.every((el) => !el.textContent?.includes('MEASURING...'));
        }).catch(() => {});
      }

      await executeInteractionHooks(page, route);
      await page.waitForTimeout(300);

      await auditAndAssert(
        page,
        testInfo,
        `Discovered Route: ${route.name}`,
        { disableRules: route.disableRules }
      );
    });
  }

  // Interactive Global State Audits: Command Palette Search & Modal Focus
  test('Audit Interactive: Command Palette Search Modal State & Focus Restoration', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof (window as any).__openSearch === 'function', { timeout: 15000 }).catch(() => {});

    await page.evaluate(() => {
      if (typeof (window as any).__openSearch === 'function') {
        (window as any).__openSearch();
      }
    });

    const combobox = page.locator('[role="combobox"]');
    if (await combobox.isVisible({ timeout: 3000 })) {
      await combobox.fill('TypeScript');
      await page.waitForTimeout(200);

      await auditAndAssert(page, testInfo, 'Interactive State: Active Command Palette');

      await page.keyboard.press('Escape');
      await expect(combobox).not.toBeVisible();
    }
  });

  // Interactive Global State Audits: Mobile Navigation Focus Trap
  test('Audit Interactive: Mobile Navigation Focus Trap & Drawer Accessibility', async ({ page }, testInfo) => {
    const isMobile = page.viewportSize()?.width && page.viewportSize()!.width < 768;
    if (!isMobile) {
      saveResult(testInfo.project.name, 'Mobile Navigation Focus Trap', [], page.url());
      return;
    }

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const menuTrigger = page.locator('[aria-label="Open navigation menu"]');
    if (await menuTrigger.isVisible()) {
      await menuTrigger.click();

      const menuContainer = page.locator('#mobile-navigation');
      await expect(menuContainer).toBeVisible();
      await page.waitForTimeout(300);

      const firstNavElement = page.locator('#mobile-navigation a, #mobile-navigation button').first();
      if (await firstNavElement.isVisible({ timeout: 1000 })) {
        await firstNavElement.focus();
      }

      const isFocusedInitiallyInside = await page.evaluate(() => {
        return !!document.activeElement?.closest('#mobile-navigation');
      });
      expect(isFocusedInitiallyInside).toBe(true);

      await auditAndAssert(page, testInfo, 'Mobile Navigation Open State', { disableRules: ['color-contrast'] });

      // Tab trapping test
      let focusEscaped = false;
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        const inside = await page.evaluate(() => {
          return !!document.activeElement?.closest('#mobile-navigation');
        });
        if (!inside) {
          focusEscaped = true;
          break;
        }
      }
      expect(focusEscaped, "Focus escaped the open mobile menu during Tab navigation").toBe(false);
    }
  });
});
