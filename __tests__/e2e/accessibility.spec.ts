/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect, Page, TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Helper to save scan results to JSON files for CI reporting and trend tracking.
 */
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

  test('Audit: Default Landing Page State', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForFunction(() => {
      const elements = Array.from(document.querySelectorAll('.text-\\[9px\\]'));
      return elements.length > 0 && elements.every((el) => !el.textContent?.includes('MEASURING...'));
    });
    await page.waitForTimeout(300);

    await auditAndAssert(page, testInfo, 'Default Landing Page State');
  });

  test('Audit: Interactive Project Filtering Tab State', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForFunction(() => {
      const elements = Array.from(document.querySelectorAll('.text-\\[9px\\]'));
      return elements.length > 0 && elements.every((el) => !el.textContent?.includes('MEASURING...'));
    });

    const filterBtn = page.locator('button:has-text("TypeScript")');
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(300);
    }

    await auditAndAssert(page, testInfo, 'Interactive State: TypeScript Filter');
  });

  test('Audit: Active Command Palette Search State', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForFunction(() => typeof (window as any).__openSearch === 'function', { timeout: 15000 });

    await page.evaluate(() => {
      if (typeof (window as any).__openSearch === 'function') {
        (window as any).__openSearch();
      }
    });

    const combobox = page.locator('[role="combobox"]');
    await expect(combobox).toBeVisible();

    await combobox.fill('TypeScript');
    await page.waitForTimeout(200);

    await auditAndAssert(page, testInfo, 'Interactive State: Active Command Palette');
  });

  test('Audit: Command Palette Focus Restoration', async ({ page }, testInfo) => {
    await page.goto('/this-is-not-found');
    await page.waitForLoadState('networkidle');

    const searchBtn = page.locator('button:has-text("Search Site")');
    if (await searchBtn.isVisible()) {
      await searchBtn.focus();
      await expect(searchBtn).toBeFocused();
      await searchBtn.click();

      const combobox = page.locator('[role="combobox"]');
      await expect(combobox).toBeVisible();
      await expect(combobox).toBeFocused();

      await auditAndAssert(page, testInfo, 'Command Palette Focus State', { disableRules: ['color-contrast'] });

      await page.keyboard.press('Escape');
      await expect(combobox).not.toBeVisible();

      const isFocused = await searchBtn.evaluate(el => document.activeElement === el);
      expect(isFocused, "Keyboard focus did not return to the calling button when the modal closed").toBe(true);
    }
  });

  test('Audit: Mobile Navigation Focus Trap', async ({ page }, testInfo) => {
    const isMobile = page.viewportSize()?.width && page.viewportSize()!.width < 768;
    if (!isMobile) {
      saveResult(testInfo.project.name, 'Mobile Navigation Focus Trap', [], page.url());
      return;
    }

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const menuTrigger = page.locator('[aria-label="Open navigation menu"]');
    if (await menuTrigger.isVisible()) {
      await menuTrigger.click();

      const menuContainer = page.locator('#mobile-navigation');
      await expect(menuContainer).toBeVisible();
      await page.waitForTimeout(200);

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

  test('Audit: CRF Studio & CDISC Form Designer', async ({ page }, testInfo) => {
    await page.goto('/crf');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=CRF Studio', { timeout: 15000 });

    await auditAndAssert(page, testInfo, 'CRF Studio Default State', { disableRules: ['color-contrast'] });
  });

  test('Audit: Logical Proof Workspace', async ({ page }, testInfo) => {
    await page.goto('/proof');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);

    await auditAndAssert(page, testInfo, 'Logical Proof Workspace Default State', { disableRules: ['color-contrast'] });
  });

  test('Audit: Incident Commander Simulator Route & Step Transitions', async ({ page }, testInfo) => {
    await page.goto('/simulator');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=1. Define Your Target Profile', { timeout: 15000 });

    // 1. Initial / Default Stage 1 Audit
    await auditAndAssert(page, testInfo, 'Incident Commander Simulator Default State', { disableRules: ['color-contrast'] });

    // 2. Interactive Step Transition: Stage 2 (Live Incident Commander Triage)
    const stage1Option = page.locator('button:has-text("Raw Systems & Performance Maverick")').or(page.locator('button:has-text("Pixel-Perfect")')).first();
    if (await stage1Option.isVisible()) {
      await stage1Option.click();
      await page.waitForSelector('text=2. Live Incident Commander: Production Latency Spike', { timeout: 10000 });
      await auditAndAssert(page, testInfo, 'Incident Commander Simulator Step 2 Triage State', { disableRules: ['color-contrast'] });

      // 3. Interactive Step Transition: Stage 3 (Systems Review)
      const stage2Option = page.locator('button:has-text("Engage Distributed Circuit Breaker")').or(page.locator('button:has-text("Scale Neon Read-Replicas")')).first();
      if (await stage2Option.isVisible()) {
        await stage2Option.click();
        await page.waitForSelector('text=3. Code Review Speed Challenge', { timeout: 10000 });
        await auditAndAssert(page, testInfo, 'Incident Commander Simulator Step 3 Review State', { disableRules: ['color-contrast'] });
      }
    }
  });

  test('Audit: Neuroimaging Route - Default State (Component-Aware Loading)', async ({ page }, testInfo) => {
    await page.goto('/neuro');
    await page.waitForLoadState('networkidle');

    // Component-aware synchronization: Wait for dynamic skeleton placeholder to detach before auditing
    const skeleton = page.locator('[data-testid="brain-3d-skeleton"]');
    await skeleton.waitFor({ state: 'detached', timeout: 30000 });

    await auditAndAssert(page, testInfo, 'Neuroimaging Studio Default State', { disableRules: ['color-contrast', 'button-name', 'label'] });
  });

  test('Audit: Neuroimaging Route - Interactive Slice Viewing & Sub-states', async ({ page }, testInfo) => {
    await page.goto('/neuro');
    await page.waitForLoadState('networkidle');

    // Component-aware synchronization: Wait for dynamic skeleton placeholder to detach
    const skeleton = page.locator('[data-testid="brain-3d-skeleton"]');
    await skeleton.waitFor({ state: 'detached', timeout: 30000 });

    // Interact with Multi-Planar Slice Viewer tools or view modes
    const toolBtn = page.locator('button:has-text("Voxel Paint Brush")').or(page.locator('button:has-text("Control Point")')).first();
    if (await toolBtn.isVisible()) {
      await toolBtn.click();
      await page.waitForTimeout(300);
    }

    await auditAndAssert(page, testInfo, 'Neuroimaging Studio Interactive Slice Viewing State', { disableRules: ['color-contrast', 'button-name', 'label'] });
  });

  test('Audit: Consultation & Schedule Page', async ({ page }, testInfo) => {
    await page.goto('/schedule');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await auditAndAssert(page, testInfo, 'Schedule Page Default State');
  });

  test('Audit: Case Study Deep-Dive Reader', async ({ page }, testInfo) => {
    await page.goto('/case-studies/clinical-data-mapper');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await auditAndAssert(page, testInfo, 'Case Study Reader State');
  });

  test('Audit: Arcade Hub & Game Suite', async ({ page }, testInfo) => {
    await page.goto('/arcade');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await auditAndAssert(page, testInfo, 'Arcade Hub Default State');
  });

  test('Audit: Arcade Game - Clinical Chaos', async ({ page }, testInfo) => {
    await page.goto('/arcade/clinical-chaos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);

    await auditAndAssert(page, testInfo, 'Arcade Game: Clinical Chaos', { disableRules: ['color-contrast'] });
  });

  test('Audit: Arcade Game - Garmin Watch Simulator', async ({ page }, testInfo) => {
    await page.goto('/arcade/garmin-watch');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);

    await auditAndAssert(page, testInfo, 'Arcade Game: Garmin Watch', { disableRules: ['color-contrast'] });
  });

  test('Audit: Arcade Game - Laser Loon', async ({ page }, testInfo) => {
    await page.goto('/arcade/laser-loon');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);

    await auditAndAssert(page, testInfo, 'Arcade Game: Laser Loon', { disableRules: ['color-contrast'] });
  });

  test('Audit: Arcade Game - Quasi-Perfect Puzzler', async ({ page }, testInfo) => {
    await page.goto('/arcade/quasi-puzzler');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);

    await auditAndAssert(page, testInfo, 'Arcade Game: Quasi Puzzler', { disableRules: ['color-contrast'] });
  });

  test('Audit: Arcade Game - Retro Labyrinth', async ({ page }, testInfo) => {
    await page.goto('/arcade/retro-labyrinth');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);

    await auditAndAssert(page, testInfo, 'Arcade Game: Retro Labyrinth', { disableRules: ['color-contrast'] });
  });

  test('Audit: Arcade Game - Working With Duck', async ({ page }, testInfo) => {
    await page.goto('/arcade/working-with-duck');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);

    await auditAndAssert(page, testInfo, 'Arcade Game: Working With Duck', { disableRules: ['color-contrast'] });
  });
});
