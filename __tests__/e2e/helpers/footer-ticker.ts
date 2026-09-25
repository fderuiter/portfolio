import type { Page } from "@playwright/test";

const TICKER = '[data-testid="footer-status-ticker"]';

/**
 * Holds the global footer ticker on its current line and waits for that line
 * to finish fading in, so an axe scan never measures the cross-fade's partial
 * opacity as a contrast failure (#952). The footer stays in scope and is
 * audited at rest, at full contrast, with or without reduced motion.
 *
 * Pages without the footer (none today) are left untouched.
 */
export async function settleFooterTicker(page: Page): Promise<void> {
  const present = await page.evaluate((selector) => {
    const ticker = document.querySelector<HTMLElement>(selector);
    ticker?.setAttribute("data-ticker-paused", "true");
    return Boolean(ticker);
  }, TICKER);
  if (!present) return;

  // AnimatePresence mode="wait" keeps one line mounted once the exit ends;
  // wait for exactly one line at full opacity.
  await page.waitForFunction((selector) => {
    const lines = document.querySelectorAll<HTMLElement>(
      `${selector} span.block`
    );
    return (
      lines.length === 1 &&
      Number(window.getComputedStyle(lines[0]).opacity) === 1
    );
  }, TICKER);
}
