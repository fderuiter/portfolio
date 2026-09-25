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

test("early station routing gives accessible guidance without an auditor penalty", async ({
  page,
}) => {
  await expect(async () => {
    await page.getByRole("button", { name: /Start 3-Phase Campaign/i }).click();
    await expect(page.locator("#cc-dossier-title")).toContainText("SUBJ-1001");
  }).toPass({ timeout: 15000 });

  const stations = page.getByRole("region", { name: "EDC stations" });
  const dm = stations.getByRole("button", { name: /DM Station/ });
  const ae = stations.getByRole("button", { name: /AE Station/ });
  const auditor = page.getByRole("meter", { name: "FDA auditor suspicion" });
  const initialSuspicion = await auditor.getAttribute("aria-valuenow");
  await expect(dm).toContainText("Fix first");
  await expect(ae).toContainText("Other domain");

  await expect(async () => {
    await dm.click();
    await expect(stations).toContainText(
      "Resolve 1 flagged observation before routing"
    );
  }).toPass({ timeout: 15000 });
  const board = page.locator('[data-keyboard-boundary="true"]');
  await board.focus();
  await board.press("1");
  await expect(stations).toContainText(
    "Resolve 1 flagged observation before routing"
  );
  await expect(
    page.getByText("21 CFR Part 11 Electronic Signature")
  ).toHaveCount(0);
  await expect(auditor).toHaveAttribute(
    "aria-valuenow",
    initialSuspicion ?? "0"
  );
});

test("a clean routine packet dispatches without the review dialog", async ({
  page,
}) => {
  await expect(async () => {
    await page.getByRole("button", { name: /Start 3-Phase Campaign/i }).click();
    await expect(page.locator("#cc-dossier-title")).toContainText("SUBJ-1001");
  }).toPass({ timeout: 15000 });

  await expect(async () => {
    await page.getByText("Validate Choice").first().click();
    await expect(
      page.getByText("CDISC Controlled Terminology Validation")
    ).toBeVisible();
  }).toPass({ timeout: 15000 });
  await page.getByRole("button", { name: /180 cm/ }).click();

  const dm = page
    .getByRole("region", { name: "EDC stations" })
    .getByRole("button", { name: /DM Station/ });
  await expect(async () => {
    await expect(dm).toContainText("Accepts");
    await dm.click();
    await expect(dm).toContainText("Submits:1");
  }).toPass({ timeout: 15000 });
  await expect(
    page.getByText("21 CFR Part 11 Electronic Signature")
  ).toHaveCount(0);
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
  // Each width taps a different slot, so a broken hit test cannot pass on the
  // previous iteration's selection.
  for (const [width, x, expected] of [
    [320, 130, "SUBJ-1002"],
    [390, 60, "SUBJ-1001"],
  ] as const) {
    await page.setViewportSize({ width, height: 844 });
    // Wait for the ResizeObserver to size the bitmap for this width
    await expect
      .poll(() =>
        canvas.evaluate(
          (element: HTMLCanvasElement) =>
            element.height ===
            Math.round((element.getBoundingClientRect().width * 5) / 13)
        )
      )
      .toBe(true);
    const canvasSize = await canvas.evaluate((element: HTMLCanvasElement) => ({
      width: element.width,
      height: element.height,
    }));
    expect(canvasSize.width).toBeLessThanOrEqual(500);
    expect(canvasSize.width).toBeGreaterThanOrEqual(200);
    await canvas.click({
      position: { x, y: canvasSize.height * 0.55 },
    });
    await expect(page.locator("#cc-dossier-title")).toContainText(expected);
  }
});
