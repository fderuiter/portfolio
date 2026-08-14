import { test, expect } from '@playwright/test';

test.describe('Visual Regression & Drift Detection', () => {
  test('Case Study components snapshot (desktop)', async ({ page }) => {
    // Emulate reduced motion to disable JS transitions/animations
    await page.emulateMedia({ reducedMotion: 'reduce' });

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

    // Wait for the Pretext measuring text to finish on ALL cards
    await page.waitForFunction(() => {
      const elements = Array.from(document.querySelectorAll('.text-\\[9px\\]'));
      if (elements.length === 0) return false;
      return elements.every(el => el.textContent && !el.textContent.includes('MEASURING...'));
    });

    // Give a brief moment for layout/scroll coordinates to settle completely
    await page.waitForTimeout(500);

    // Take full page snapshot to cover case study components
    await expect(page).toHaveScreenshot('home.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test('Layout constraints drift detection', async ({ page }) => {
    // Emulate reduced motion to disable JS transitions/animations
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Inject the global flag for the client so the component enables the checks
    await page.addInitScript(() => {
      (window as unknown as { __PLAYWRIGHT_TEST__?: boolean }).__PLAYWRIGHT_TEST__ = true;
    });

    await page.goto('/');
    // Wait for the Pretext measuring text to finish on ALL cards
    await page.waitForFunction(() => {
      const elements = Array.from(document.querySelectorAll('.text-\\[9px\\]'));
      if (elements.length === 0) return false;
      return elements.every(el => el.textContent && !el.textContent.includes('MEASURING...'));
    });

    // Give a brief moment for layout/scroll coordinates to settle completely
    await page.waitForTimeout(500);

    // Wait for at least one card to be present and hydrated
    await page.waitForSelector('[data-card-slug]');

    // Select all cards inside the grid
    const cards = await page.locator('[data-card-slug]').all();
    for (const card of cards) {
      const slug = await card.getAttribute('data-card-slug');
      const expected = await card.getAttribute('data-expected-height');
      const actual = await card.getAttribute('data-actual-height');

      const mismatch = await card.getAttribute('data-hydration-mismatch');
      if (mismatch === 'true') {
        expect(actual, `Drift detected! Card '${slug}' mathematically expected ${expected}px but naturally measured ${actual}px. Update padding constants.`).toBe(expected);
      }
    }
  });
});
