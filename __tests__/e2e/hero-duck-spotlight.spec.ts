import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "320px", width: 320, height: 568 },
  { name: "375px", width: 375, height: 667 },
  { name: "768px", width: 768, height: 1024 },
  { name: "1440px", width: 1440, height: 900 },
];

test.describe("Hero Duck spotlight", () => {
  for (const viewport of VIEWPORTS) {
    test(`keeps all controls usable at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");

      const spotlight = page.locator('[data-testid="bio-spotlight"]');
      await expect(async () => {
        await expect(spotlight).toBeVisible();
        await expect(
          page.getByRole("heading", {
            name: /Meet Duck: From 8-Week Fluff to 80-lb Marshmallow/i,
          })
        ).toBeVisible();
      }).toPass({ timeout: 15000 });

      // Verify the old demo card is gone
      await expect(
        page.getByRole("tablist", { name: "Interactive Systems Demos" })
      ).toHaveCount(0);
      await expect(page.getByText(/A Few Things to Try/i)).toHaveCount(0);

      const milestoneGroup = page.getByRole("group", {
        name: "Photo growth milestones",
      });
      await expect(milestoneGroup).toBeVisible();

      const milestoneButtons = milestoneGroup.getByRole("button");
      await expect(milestoneButtons).toHaveCount(6);

      // Verify milestone buttons meet 44px touch targets and stay in viewport
      await expect(async () => {
        for (let index = 0; index < 6; index += 1) {
          const button = milestoneButtons.nth(index);
          await expect(button).toBeVisible();
          const box = await button.boundingBox();
          expect(
            box,
            `milestone ${index + 1} bounding box must be available`
          ).not.toBeNull();
          expect(
            box?.height ?? 0,
            `milestone ${index + 1} must meet the 44px touch target height`
          ).toBeGreaterThanOrEqual(44);
          expect(
            box?.width ?? 0,
            `milestone ${index + 1} must meet the 44px touch target width`
          ).toBeGreaterThanOrEqual(44);
          expect(
            box?.x ?? -1,
            `milestone ${index + 1} begins outside the viewport`
          ).toBeGreaterThanOrEqual(0);
          expect(
            (box?.x ?? 0) + (box?.width ?? 0),
            `milestone ${index + 1} extends outside the viewport`
          ).toBeLessThanOrEqual(viewport.width);
        }
      }).toPass({ timeout: 15000 });

      // Verify navigation buttons meet touch targets
      const prevButton = page.getByRole("button", {
        name: "Previous co-pilot milestone photo",
      });
      const nextButton = page.getByRole("button", {
        name: "Next co-pilot milestone photo",
      });

      for (const [name, button] of [
        ["prev", prevButton],
        ["next", nextButton],
      ] as const) {
        await expect(button).toBeVisible();
        const box = await button.boundingBox();
        expect(
          box,
          `${name} button bounding box must be available`
        ).not.toBeNull();
        expect(
          box?.height ?? 0,
          `${name} button must meet the 44px touch target height`
        ).toBeGreaterThanOrEqual(44);
        expect(
          box?.width ?? 0,
          `${name} button must meet the 44px touch target width`
        ).toBeGreaterThanOrEqual(44);
      }

      // Verify initial state: stage 1 is selected
      await expect(milestoneButtons.nth(0)).toHaveAttribute(
        "aria-pressed",
        "true"
      );
      await expect(page.getByText("Stage 1 of 6")).toBeVisible();

      // Navigate forward via Next button
      await nextButton.click();
      await expect(milestoneButtons.nth(1)).toHaveAttribute(
        "aria-pressed",
        "true"
      );
      await expect(page.getByText("Stage 2 of 6")).toBeVisible();

      // Navigate backward via Prev button
      await prevButton.click();
      await expect(milestoneButtons.nth(0)).toHaveAttribute(
        "aria-pressed",
        "true"
      );
      await expect(page.getByText("Stage 1 of 6")).toBeVisible();

      // Jump directly to milestone 4
      await milestoneButtons.nth(3).click();
      await expect(milestoneButtons.nth(3)).toHaveAttribute(
        "aria-pressed",
        "true"
      );
      await expect(page.getByText("Stage 4 of 6")).toBeVisible();

      // Verify no horizontal overflow in the hero section
      const overflow = await page.evaluate(() => {
        const clientWidth = document.documentElement.clientWidth;
        return Array.from(document.querySelectorAll("#hero *")).some(
          (element) => element.getBoundingClientRect().right > clientWidth + 1
        );
      });
      expect(overflow).toBe(false);
    });
  }

  test("contains enlarged and unbroken spotlight content at 320px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /Meet Duck: From 8-Week Fluff to 80-lb Marshmallow/i,
      })
    ).toBeVisible();

    await page.addStyleTag({
      content: "#hero { font-size: 200%; }",
    });

    const milestoneGroup = page.getByRole("group", {
      name: "Photo growth milestones",
    });
    await expect(milestoneGroup).toBeVisible();

    const overflow = await page.evaluate(() => {
      const clientWidth = document.documentElement.clientWidth;
      return Array.from(document.querySelectorAll("#hero *")).some(
        (element) => element.getBoundingClientRect().right > clientWidth + 1
      );
    });
    expect(overflow).toBe(false);
  });
});
