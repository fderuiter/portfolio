import { test, expect } from '@playwright/test';

test.describe('Visual Regression & Drift Detection', () => {
  test('Case Study components snapshot (desktop)', async ({ page }) => {
    // Wait for the hydration and masonry layout to be stable
    await page.goto('/');
    
    // Disable animations for consistent snapshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          transition: none !important;
          animation: none !important;
        }
      `
    });

    // Wait for network requests or images if any
    await page.waitForLoadState('networkidle');

    // Take full page snapshot to cover case study components
    await expect(page).toHaveScreenshot('home.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Layout constraints drift detection', async ({ page }) => {
    // Inject the global flag for the client so the component enables the checks
    await page.addInitScript(() => {
      (window as unknown as { __PLAYWRIGHT_TEST__: boolean }).__PLAYWRIGHT_TEST__ = true;
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for the Pretext measuring text to finish
    await page.waitForFunction(() => {
      return document.querySelector('.text-\\[9px\\]') && !document.querySelector('.text-\\[9px\\]')?.textContent?.includes('MEASURING...');
    });

    // Check if any card reported a hydration mismatch via the data attribute
    const mismatchedCards = await page.locator('[data-hydration-mismatch="true"]').all();
    
    for (const card of mismatchedCards) {
      const expected = await card.getAttribute('data-expected-height');
      const actual = await card.getAttribute('data-actual-height');
      // If there's a mismatched card, this will intentionally fail the test
      expect(actual, `Drift detected! Card mathematically expected ${expected}px but naturally measured ${actual}px. Update padding constants.`).toBe(expected);
    }
  });
});
