import { test, expect } from "@playwright/test";

test.describe("Visual Regression & Drift Detection", () => {
  test("Case Study components snapshot (desktop)", async ({ page }) => {
    // Emulate reduced motion to disable JS transitions/animations
    await page.emulateMedia({ reducedMotion: "reduce" });

    // Wait for the hydration and masonry layout to be stable
    await page.goto("/");

    // Disable animations for consistent snapshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          transition: none !important;
          animation: none !important;
        }
      `,
    });

    // Wait for the Pretext measuring text to finish on ALL cards
    await page.waitForFunction(() => {
      const elements = Array.from(document.querySelectorAll(".text-\\[9px\\]"));
      if (elements.length === 0) return false;
      return elements.every(
        (el) => el.textContent && !el.textContent.includes("MEASURING...")
      );
    });

    // Give a brief moment for layout/scroll coordinates to settle completely
    await page.waitForTimeout(500);

    // Take full page snapshot to cover case study components
    await expect(page).toHaveScreenshot("home.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("Layout constraints drift detection", async ({ page }) => {
    // Emulate reduced motion to disable JS transitions/animations
    await page.emulateMedia({ reducedMotion: "reduce" });

    // Inject the global flag for the client so the component enables the checks
    await page.addInitScript(() => {
      (
        window as unknown as { __PLAYWRIGHT_TEST__?: boolean }
      ).__PLAYWRIGHT_TEST__ = true;
    });

    await page.goto("/");
    // Wait for the Pretext measuring text to finish on ALL cards
    await page.waitForFunction(() => {
      const elements = Array.from(document.querySelectorAll(".text-\\[9px\\]"));
      if (elements.length === 0) return false;
      return elements.every(
        (el) => el.textContent && !el.textContent.includes("MEASURING...")
      );
    });

    // Give a brief moment for layout/scroll coordinates to settle completely
    await page.waitForTimeout(500);

    // Wait for at least one card to be present and hydrated
    await page.waitForSelector("[data-card-slug]");

    // Select all cards inside the grid
    const cards = await page.locator("[data-card-slug]").all();
    for (const card of cards) {
      const slug = await card.getAttribute("data-card-slug");
      const expected = await card.getAttribute("data-expected-height");
      const actual = await card.getAttribute("data-actual-height");

      const mismatch = await card.getAttribute("data-hydration-mismatch");
      if (mismatch === "true") {
        expect(
          actual,
          `Drift detected! Card '${slug}' mathematically expected ${expected}px but naturally measured ${actual}px. Update padding constants.`
        ).toBe(expected);
      }
    }
  });

  const viewports = [
    { name: "Mobile 320px Squeeze", width: 320, height: 568 },
    { name: "Mobile 375px", width: 375, height: 667 },
    { name: "Tablet 768px", width: 768, height: 1024 },
    { name: "Desktop 1440px", width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`Horizontal Overflow Detector across DOM on ${vp.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Detect any uncontained element overflowing the horizontal viewport boundary
      const overflowingElements = await page.evaluate(() => {
        const clientWidth = document.documentElement.clientWidth;
        const badElements: {
          tag: string;
          className: string;
          right: number;
          clientWidth: number;
        }[] = [];

        document.querySelectorAll("*").forEach((el) => {
          // Skip elements contained inside an explicitly clipped or scrollable horizontal container
          let parent = el.parentElement;
          let isContained = false;
          while (
            parent &&
            parent !== document.body &&
            parent !== document.documentElement
          ) {
            const style = window.getComputedStyle(parent);
            if (
              style.overflowX === "hidden" ||
              style.overflowX === "auto" ||
              style.overflowX === "scroll" ||
              style.overflowX === "clip" ||
              style.overflow === "hidden" ||
              style.overflow === "clip"
            ) {
              isContained = true;
              break;
            }
            parent = parent.parentElement;
          }
          if (isContained) return;

          const rect = el.getBoundingClientRect();
          // Allow small 1px subpixel tolerance
          if (rect.right > clientWidth + 1) {
            badElements.push({
              tag: el.tagName.toLowerCase(),
              className:
                typeof el.className === "string"
                  ? el.className.slice(0, 50)
                  : "",
              right: Math.round(rect.right),
              clientWidth,
            });
          }
        });

        return badElements;
      });

      expect(
        overflowingElements,
        `Horizontal overflow detected on viewport ${vp.name} (${vp.width}x${vp.height})`
      ).toEqual([]);
    });
  }
});
