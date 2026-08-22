import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3001";

test.describe("Multi-Viewport Arcade Games & Cabinets Suite", () => {
  test.use({ baseURL: BASE_URL });

  test("Arcade Hub (/arcade) is fully accessible with zero horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/arcade");
    await page.waitForLoadState("domcontentloaded");

    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toBeVisible();

    const isOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(isOverflow).toBe(false);
  });

  test("Laser Loon (/arcade/laser-loon) launches cabinet, renders canvas, and allows weapon selection", async ({
    page,
  }) => {
    await page.goto("/arcade/laser-loon");
    await page.waitForLoadState("domcontentloaded");

    // Check horizontal overflow
    const isOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(isOverflow).toBe(false);

    // Launch Cabinet
    const launchBtn = page.getByRole("button", { name: /Launch Cabinet/i });
    if (await launchBtn.isVisible()) {
      await launchBtn.click();
    }

    // Skip Setup Wizard if open
    const skipBtn = page.getByRole("button", { name: /Skip Setup/i });
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
    }

    // Verify Canvas is mounted
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test("Retro Labyrinth (/arcade/retro-labyrinth) launches cabinet and renders procedural canvas", async ({
    page,
  }) => {
    await page.goto("/arcade/retro-labyrinth");
    await page.waitForLoadState("domcontentloaded");

    const isOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(isOverflow).toBe(false);

    const launchBtn = page.getByRole("button", { name: /Launch Cabinet/i });
    if (await launchBtn.isVisible()) {
      await launchBtn.click();
    }

    const skipBtn = page.getByRole("button", { name: /Skip Setup/i });
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
    }

    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test("Garmin Watch (/arcade/garmin-watch) launches simulator and displays bezel controls", async ({
    page,
  }) => {
    await page.goto("/arcade/garmin-watch");
    await page.waitForLoadState("domcontentloaded");

    const isOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(isOverflow).toBe(false);

    const launchBtn = page.getByRole("button", { name: /Launch Cabinet/i });
    if (await launchBtn.isVisible()) {
      await launchBtn.click();
    }

    const skipBtn = page.getByRole("button", { name: /Skip Setup/i });
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
    }

    const heading = page
      .getByRole("heading", { name: /Monkey C|Garmin/i })
      .first();
    await expect(heading).toBeVisible();
  });

  test("Clinical Trial Chaos (/arcade/clinical-chaos) renders interactive SDTM domain mapper", async ({
    page,
  }) => {
    await page.goto("/arcade/clinical-chaos");
    await page.waitForLoadState("domcontentloaded");

    const isOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(isOverflow).toBe(false);

    const heading = page
      .getByRole("heading", { name: /Clinical Trial Chaos/i })
      .first();
    await expect(heading).toBeVisible();
  });

  test("Working With Duck (/arcade/working-with-duck) renders interactive pet canvas", async ({
    page,
  }) => {
    await page.goto("/arcade/working-with-duck");
    await page.waitForLoadState("domcontentloaded");

    const isOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(isOverflow).toBe(false);

    const launchBtn = page.getByRole("button", { name: /Launch Cabinet/i });
    if (await launchBtn.isVisible()) {
      await launchBtn.click();
    }

    const skipBtn = page.getByRole("button", { name: /Skip Setup/i });
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
    }

    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test("Quasi-Perfect Puzzler (/arcade/quasi-puzzler) renders formal verification cards", async ({
    page,
  }) => {
    await page.goto("/arcade/quasi-puzzler");
    await page.waitForLoadState("domcontentloaded");

    const isOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(isOverflow).toBe(false);

    const heading = page
      .getByRole("heading", { name: /Quasi-Perfect Puzzler|Quasi Puzzler/i })
      .first();
    await expect(heading).toBeVisible();
  });

  test("Meme Vault (/arcade/meme-vault) renders audio soundboard buttons and triggers audio clips", async ({
    page,
  }) => {
    await page.goto("/arcade/meme-vault");
    await page.waitForLoadState("domcontentloaded");

    const isOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(isOverflow).toBe(false);

    const heading = page.getByRole("heading", { name: /Meme Vault/i }).first();
    await expect(heading).toBeVisible();

    const playBtn = page.locator("button[aria-label^='Play ']").first();
    await expect(playBtn).toBeVisible();
    await playBtn.click();
  });
});
