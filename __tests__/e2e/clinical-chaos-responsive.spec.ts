import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/arcade/clinical-chaos");
  if (isMobile) {
    const tryAnyway = page.getByRole("button", { name: /Try it anyway/i });
    await expect(async () => {
      await expect(tryAnyway).toBeVisible();
      await tryAnyway.click();
      await expect(tryAnyway).toBeHidden();
    }).toPass({ timeout: 15000 });
  }
  await expect(async () => {
    await page.getByRole("button", { name: /Launch Cabinet/i }).click();
    await expect(page.locator("canvas[role='application']")).toBeVisible();
  }).toPass({ timeout: 15000 });
});

test("desktop start keeps the Next instruction in view", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Desktop viewport assertion");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(async () => {
    await page.getByRole("button", { name: /Start 3-Phase Campaign/i }).click();
    await expect(page.getByText("Next:", { exact: true })).toBeVisible();
  }).toPass({ timeout: 15000 });
  await expect(page.getByText("Next:", { exact: true })).toBeInViewport({
    ratio: 1,
  });
  const canvas = page.locator("canvas[role='application']");
  await expect(canvas).toHaveAttribute("height", "150");
});

test("phone fallback keeps a visible compact and selectable canvas", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Touch viewport assertion");
  await expect(async () => {
    await page.getByRole("button", { name: /Start 3-Phase Campaign/i }).click();
    await expect(page.locator("#cc-dossier-title")).toContainText("SUBJ-1001");
  }).toPass({ timeout: 15000 });
  const canvas = page.locator("canvas[role='application']");
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const canvasSize = await canvas.evaluate((element: HTMLCanvasElement) => ({
      width: element.width,
      height: element.height,
      displayWidth: element.getBoundingClientRect().width,
    }));
    expect(canvasSize.width).toBeLessThanOrEqual(500);
    expect(canvasSize.height).toBe(
      Math.round((canvasSize.displayWidth * 5) / 13)
    );
    expect(canvasSize.width).toBeGreaterThanOrEqual(200);
    await canvas.click({
      position: { x: 130, y: canvasSize.height * 0.55 },
    });
    await expect(page.locator("#cc-dossier-title")).toContainText("SUBJ-1002");
  }
});
