import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTE = "/arcade/trial-and-error";
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const BLOCKING = new Set(["critical", "serious", "moderate"]);

async function launch(page: Page) {
  await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
  await expect(async () => {
    const launchBtn = page.getByRole("button", { name: /Launch Cabinet/i });
    if (await launchBtn.isVisible()) {
      await launchBtn.click();
    }
    await expect(page.getByRole("grid")).toBeVisible({ timeout: 3000 });
  }).toPass({ timeout: 30000 });
}

async function expectNoBlockingViolations(page: Page, state: string) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const blocking = results.violations
    .filter((v) => BLOCKING.has(v.impact ?? ""))
    .map(
      (v) =>
        `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`
    );
  expect(blocking, `axe violations in state "${state}"`).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

const gridCell = (page: Page, row: number, col: number) =>
  page
    .getByRole("row")
    .nth(row + 1)
    .getByRole("gridcell")
    .nth(col);

test.describe("Trial & Error: Biostat Ops QC Desk", () => {
  test("is fully keyboard-playable: review, correct, play, and clear the Small Blind", async ({
    page,
  }) => {
    await launch(page);
    await gridCell(page, 0, 0).focus();

    // Walk every cell with the arrow keys, inspecting and correcting as we go.
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        await expect(gridCell(page, row, col)).toBeFocused();
        await page.keyboard.press("Enter");
        await page.keyboard.press("c");
        if (col < 2) await page.keyboard.press("ArrowRight");
      }
      if (row < 4) {
        await page.keyboard.press("Home");
        await page.keyboard.press("ArrowDown");
      }
    }

    await expect(page.getByTestId("expected-value")).toHaveText(
      "[57] × [8] = 456"
    );
    await expect(page.getByTestId("desk-announcer")).not.toBeEmpty();
    await page.keyboard.press("p");
    await expect(page.getByTestId("blind-result")).toContainText(
      "Blind cleared"
    );
    await expect(
      page.getByRole("button", { name: "Restart Blind" })
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(gridCell(page, 0, 0)).toBeFocused();
  });

  test("discards with D for 1 CPU", async ({ page }) => {
    await launch(page);
    await gridCell(page, 0, 0).focus();
    await page.keyboard.press("d");
    await expect(page.getByTestId("cpu-counter")).toContainText("5/6");
    await expect(
      page.getByText("Draft B (v0.2)", { exact: true })
    ).toBeVisible();
  });

  for (const width of [390, 1440]) {
    test(`has zero blocking axe violations in every game state at ${width}px`, async ({
      page,
    }) => {
      // Five full-page axe scans plus a cabinet launch can outrun the default
      // 30s test budget when workers share the CPU.
      test.slow();
      // Audit settled frames: the site footer's status ticker cross-fades every
      // few seconds, and a scan landing mid-fade reads a blended ~1.3:1 colour
      // (#952). Reduced motion makes that swap instant without narrowing the
      // audit to the cabinet.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width, height: 900 });
      await launch(page);
      await expectNoBlockingViolations(page, "fresh desk");

      await gridCell(page, 2, 2).click();
      await expectNoBlockingViolations(page, "fatal redline revealed");

      await page.getByRole("button", { name: /Flag & Correct/ }).click();
      await expectNoBlockingViolations(page, "finding corrected");

      await page.getByRole("button", { name: /Approve & Play/ }).click();
      await expect(
        page.getByText("Draft B (v0.2)", { exact: true })
      ).toBeVisible();
      await expectNoBlockingViolations(page, "after a played hand");

      for (let i = 0; i < 2; i++) {
        await page.getByRole("button", { name: /Reject & Discard/ }).click();
      }
      await expect(page.getByTestId("blind-result")).toBeVisible();
      await expectNoBlockingViolations(page, "blind over");
    });
  }

  for (const width of [320, 375, 768, 1440]) {
    test(`has no horizontal page overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await launch(page);
      await gridCell(page, 2, 1).click();
      await expectNoHorizontalOverflow(page);
    });
  }

  test("reflows without page overflow at 200% zoom", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await launch(page);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await gridCell(page, 2, 2).click();
    await expectNoHorizontalOverflow(page);
  });

  test("respects prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await launch(page);
    // globals.css clamps every animation to 0.01ms and one iteration under
    // reduced motion; any animation still running longer is a regression.
    const lingering = await page
      .locator('section[aria-labelledby="qc-desk-heading"] *')
      .evaluateAll(
        (els) =>
          els
            .map((el) => getComputedStyle(el))
            .filter(
              (style) =>
                style.animationName !== "none" &&
                (parseFloat(style.animationDuration) > 0.01 ||
                  style.animationIterationCount !== "1")
            ).length
      );
    expect(lingering).toBe(0);
  });
  test.describe("cabinet loud-moment switch (ADR 0046 amendment)", () => {
    const cabinet = (page: Page) => page.locator("[data-te-cabinet]");

    test("enables loud layers on desktop without reduced motion", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await launch(page);
      await expect(cabinet(page)).toHaveAttribute("data-te-loud", "on");
    });

    test("keeps loud layers off under reduced motion", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await launch(page);
      await expect(cabinet(page)).toHaveAttribute("data-te-loud", "off");
    });

    test("keeps loud layers off below 768px", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await launch(page);
      await expect(cabinet(page)).toHaveAttribute("data-te-loud", "off");
    });

    test("scopes --te-* tokens to the cabinet", async ({ page }) => {
      await launch(page);
      const inside = await cabinet(page).evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--te-chips").trim()
      );
      const outside = await page.evaluate(() =>
        getComputedStyle(document.body).getPropertyValue("--te-chips").trim()
      );
      expect(inside).toBe("#93c5fd");
      expect(outside).toBe("");
    });
  });
});
