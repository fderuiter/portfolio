import { test, expect } from "@playwright/test";

// ADR 0048: six games show a desktop-only notice on phones and portrait
// tablets. Each case sets its own viewport and touch emulation so the spec
// means the same thing under every Playwright project.
const GATED = [
  "working-with-duck",
  "laser-loon",
  "quasi-puzzler",
  "garmin-watch",
  "clinical-chaos",
  "retro-labyrinth",
];

test.describe("Desktop-only arcade gate", () => {
  test.describe("on a phone", () => {
    test.use({
      viewport: { width: 390, height: 664 },
      hasTouch: true,
      isMobile: true,
    });

    for (const slug of GATED) {
      test(`${slug} shows the notice instead of the cabinet`, async ({
        page,
        browserName,
      }) => {
        test.skip(browserName === "firefox", "isMobile is unsupported");
        await page.goto(`/arcade/${slug}`);
        await expect(page.getByTestId("desktop-only-notice")).toBeVisible();
        await expect(
          page.getByRole("button", { name: /Launch Cabinet/i })
        ).toBeHidden();
        await expect(page.locator("h1")).toBeVisible();
      });
    }

    test("Try it anyway reveals the cabinet", async ({ page, browserName }) => {
      test.skip(browserName === "firefox", "isMobile is unsupported");
      await page.goto("/arcade/laser-loon");
      await expect(async () => {
        await page.getByRole("button", { name: /Try it anyway/i }).click();
        await expect(
          page.getByRole("button", { name: /Launch Cabinet/i })
        ).toBeVisible();
      }).toPass({ timeout: 15000 });
    });

    test("Trial & Error stays playable", async ({ page, browserName }) => {
      test.skip(browserName === "firefox", "isMobile is unsupported");
      await page.goto("/arcade/trial-and-error");
      await expect(
        page.getByRole("button", { name: /Launch Cabinet/i })
      ).toBeVisible();
      await expect(page.getByTestId("desktop-only-notice")).toHaveCount(0);
    });
  });

  test.describe("in a narrow desktop window", () => {
    test.use({
      viewport: { width: 375, height: 667 },
      hasTouch: false,
      isMobile: false,
    });

    test("a fine pointer still gets the game", async ({ page }) => {
      await page.goto("/arcade/laser-loon");
      await expect(
        page.getByRole("button", { name: /Launch Cabinet/i })
      ).toBeVisible();
      await expect(page.getByTestId("desktop-only-notice")).toBeHidden();
    });
  });
});
