import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTE = "/arcade/trial-and-error";
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const BLOCKING = new Set(["critical", "serious", "moderate"]);
const DRAFT_A = "C-T14.1.1-A";
const DM_LISTING = "C-L16.2.4";

async function launch(page: Page) {
  await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
  await expect(async () => {
    const launchBtn = page.getByRole("button", { name: /Launch Cabinet/i });
    if (await launchBtn.isVisible()) {
      await launchBtn.click();
    }
    await expect(page.getByTestId("hand")).toBeVisible({ timeout: 3000 });
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

const card = (page: Page, id: string) => page.locator(`[data-card-id="${id}"]`);
const drawer = (page: Page) => page.getByTestId("inspect-drawer");
const gridCell = (page: Page, row: number, col: number) =>
  drawer(page)
    .getByRole("row")
    .nth(row + 1)
    .getByRole("gridcell")
    .nth(col);

test.describe("Trial & Error: Biostat Ops Card Table", () => {
  test("is fully keyboard-playable: inspect, correct, select, play and clear the Small Blind", async ({
    page,
  }) => {
    await launch(page);
    await card(page, DRAFT_A).focus();

    // Inspect Draft A (1 CPU): focus moves into the drawer's review grid.
    await page.keyboard.press("i");
    await expect(drawer(page)).toBeVisible();
    await expect(gridCell(page, 0, 0)).toBeFocused();
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
    await expect(drawer(page).getByTestId("expected-value")).toHaveText(
      "[57] × [8] = 456"
    );

    // Escape closes the drawer and returns focus to the card.
    await page.keyboard.press("Escape");
    await expect(drawer(page)).toBeHidden();
    await expect(card(page, DRAFT_A)).toBeFocused();

    // Select the TLF Pair and play it with Enter.
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowRight");
    await expect(card(page, DM_LISTING)).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.getByTestId("hand-preview")).toContainText("TLF Pair");
    await expect(page.getByTestId("unverified-flag")).toBeHidden();
    await page.keyboard.press("Enter");

    await expect(page.getByTestId("blind-result")).toContainText(
      "Blind cleared"
    );
    await expect(page.getByTestId("blind-result")).toContainText("828 of 300");
    await expect(
      page.getByRole("button", { name: "Restart Blind" })
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(card(page, DRAFT_A)).toBeFocused();
  });

  test("an uninspected card still zeroes the hand, and D discards for 1 CPU", async ({
    page,
  }) => {
    await launch(page);
    await card(page, DRAFT_A).focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Space");
    await expect(page.getByTestId("unverified-flag")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("last-hand")).toContainText(
      "(zero-score rule)"
    );
    await expect(page.getByTestId("cpu-counter")).toHaveText("8/10");

    await page.keyboard.press("Space");
    await page.keyboard.press("d");
    await expect(page.getByTestId("cpu-counter")).toHaveText("7/10");
    await expect(page.locator("[data-card-id]:focus")).toHaveCount(1);
  });

  for (const width of [390, 1440]) {
    test(`has zero blocking axe violations in every table state at ${width}px`, async ({
      page,
    }) => {
      // Several full-page axe scans plus a cabinet launch can outrun the
      // default 30s test budget when workers share the CPU.
      test.slow();
      // Audit settled frames: the site footer's status ticker cross-fades every
      // few seconds, and a scan landing mid-fade reads a blended ~1.3:1 colour
      // (#952). Reduced motion makes that swap instant without narrowing the
      // audit to the cabinet.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width, height: 900 });
      await launch(page);
      await expectNoBlockingViolations(page, "fresh hand");

      await card(page, DRAFT_A).click();
      await card(page, DM_LISTING).click();
      await expect(page.getByTestId("unverified-flag")).toBeVisible();
      await expectNoBlockingViolations(page, "pair selected, unverified");

      await card(page, DRAFT_A).focus();
      await page.keyboard.press("i");
      await expect(drawer(page)).toBeVisible();
      await gridCell(page, 2, 2).click();
      await expectNoBlockingViolations(
        page,
        "inspect drawer, fatal redline revealed"
      );

      await drawer(page)
        .getByRole("button", { name: /Flag & Correct/ })
        .click();
      await drawer(page)
        .getByRole("button", { name: /Close Inspect/ })
        .click();
      await expect(drawer(page)).toBeHidden();
      await expectNoBlockingViolations(page, "after a correction");

      await page.getByRole("button", { name: /Play Hand/ }).click();
      await expect(page.getByTestId("last-hand")).toBeVisible();
      await expectNoBlockingViolations(page, "after a played hand");

      // Spend the remaining CPU on single-card hands until the Blind ends.
      for (let i = 0; i < 6; i++) {
        if (await page.getByTestId("blind-result").isVisible()) break;
        await page.locator("[data-card-id]").first().click();
        await page.getByRole("button", { name: /Play Hand/ }).click();
      }
      await expect(page.getByTestId("blind-result")).toBeVisible();
      await expectNoBlockingViolations(page, "blind over");
    });
  }

  for (const width of [320, 375, 768, 1440]) {
    test(`has no horizontal page overflow at ${width}px, with and without the drawer`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await launch(page);
      await card(page, DRAFT_A).click();
      await expectNoHorizontalOverflow(page);
      await card(page, DRAFT_A).focus();
      await page.keyboard.press("i");
      await expect(drawer(page)).toBeVisible();
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
    await card(page, DRAFT_A).click();
    await expectNoHorizontalOverflow(page);
  });

  test("respects prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await launch(page);
    // globals.css clamps every animation to 0.01ms and one iteration under
    // reduced motion; any animation still running longer is a regression.
    const lingering = await page
      .locator('section[aria-labelledby="card-table-heading"] *')
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
