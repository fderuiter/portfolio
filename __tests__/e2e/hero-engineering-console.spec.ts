import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "320px", width: 320, height: 568 },
  { name: "375px", width: 375, height: 667 },
  { name: "768px", width: 768, height: 1024 },
  { name: "1440px", width: 1440, height: 900 },
];

test.describe("Hero engineering console", () => {
  for (const viewport of VIEWPORTS) {
    test(`keeps all controls usable at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");

      const tablist = page.getByRole("tablist", {
        name: "Interactive Systems Demos",
      });

      await expect(async () => {
        await expect(tablist).toBeVisible();
        await expect(tablist.getByRole("tab")).toHaveCount(3);
      }).toPass({ timeout: 15000 });

      const tabs = tablist.getByRole("tab");
      await expect(async () => {
        for (let index = 0; index < 3; index += 1) {
          const tab = tabs.nth(index);
          await expect(tab).toBeVisible();
          const box = await tab.boundingBox();
          expect(box, `tab ${index + 1} bounding box must be available`).not.toBeNull();
          expect(
            box?.height ?? 0,
            `tab ${index + 1} must meet the 44px touch target`
          ).toBeGreaterThanOrEqual(44);
          expect(
            box?.x ?? -1,
            `tab ${index + 1} begins outside the viewport`
          ).toBeGreaterThanOrEqual(0);
          expect(
            (box?.x ?? 0) + (box?.width ?? 0),
            `tab ${index + 1} extends outside the viewport`
          ).toBeLessThanOrEqual(viewport.width);
        }
      }).toPass({ timeout: 15000 });

      await tabs.nth(0).focus();
      await page.keyboard.press("ArrowRight");
      await expect(tabs.nth(1)).toBeFocused();
      await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");

      await page.keyboard.press("End");
      await expect(tabs.nth(2)).toBeFocused();
      await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");

      await expect(async () => {
        await page.getByRole("button", { name: "Clean Memory (GC)" }).click();
        await page.getByRole("button", { name: "Reset Memory Demo" }).click();
        await expect(page.getByText("Memory demo reset.")).toBeAttached();
      }).toPass({ timeout: 15000 });

      await expect(async () => {
        await tabs.nth(0).click();
        await page.getByRole("button", { name: "Apply the Rule" }).click();
        await page.getByRole("button", { name: "Reset Logic Demo" }).click();
        await expect(page.getByText("Logic demo reset.")).toBeAttached();
      }).toPass({ timeout: 15000 });

      await expect(async () => {
        await tabs.nth(1).click();
        await page
          .getByRole("button", { name: "Illustrative Integrity Rule: Active" })
          .click();
        await page.getByRole("button", { name: "Reset Clinical Demo" }).click();
        await expect(
          page.getByRole("button", {
            name: "Illustrative Integrity Rule: Active",
          })
        ).toBeVisible();
        await expect(page.getByText("Clinical demo reset.")).toBeAttached();
      }).toPass({ timeout: 15000 });

      const overflow = await page.evaluate(() => {
        const clientWidth = document.documentElement.clientWidth;
        return Array.from(document.querySelectorAll("#hero *")).some(
          (element) => element.getBoundingClientRect().right > clientWidth + 1
        );
      });
      expect(overflow).toBe(false);
    });
  }

  test("contains enlarged and unbroken console content at 320px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    await expect(
      page.getByRole("tablist", { name: "Interactive Systems Demos" })
    ).toBeVisible();

    await page.addStyleTag({
      content: "#hero { font-size: 200%; }",
    });
    const memoryTab = page.getByRole("tab", { name: "Memory" });
    await expect(async () => {
      await expect(memoryTab).toBeVisible();
      await memoryTab.click();
      await expect(memoryTab).toHaveAttribute("aria-selected", "true");
    }).toPass({ timeout: 15000 });
    await page
      .getByText("Illustrative frame reference: 16.6ms")
      .evaluate((node) => {
        node.textContent = "A".repeat(240);
      });

    const overflow = await page.evaluate(() => {
      const clientWidth = document.documentElement.clientWidth;
      return Array.from(document.querySelectorAll("#hero *")).some(
        (element) => element.getBoundingClientRect().right > clientWidth + 1
      );
    });
    expect(overflow).toBe(false);
  });
});
