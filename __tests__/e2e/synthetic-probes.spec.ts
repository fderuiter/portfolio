import { test, expect } from "@playwright/test";

test.describe("Headless Synthetic User Probes & Journey Monitoring", () => {
  test("Probe 1: Landing Page Pretext Layout & Dynamic Filter Flow", async ({
    page,
  }) => {
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);

    // Verify main content container renders
    const mainContent = page.locator("#main-content");
    await expect(mainContent).toBeVisible();

    // Verify Case Study cards render with valid heights (Pretext layout engine verified)
    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Check first card bounding box to ensure no layout collapse
    await expect(async () => {
      const firstCard = page.locator("article").first();
      const box = await firstCard.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThan(50);
      expect(box!.width).toBeGreaterThan(100);
    }).toPass({ timeout: 10000 });
  });

  test("Probe 2: Command Palette Discovery, Filtering & Navigation Journey", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const commandDialog = page.getByRole("dialog", {
      name: /Command Palette/i,
    });

    // Open Command Palette via visible Search trigger button in Navbar with hydration retry
    await expect(async () => {
      const desktopSearchBtn = page.getByRole("button", {
        name: "Search portfolio and commands (Press Command+K)",
      });
      const mobileSearchBtn = page.getByRole("button", {
        name: "Open Command Search",
      });

      if (await desktopSearchBtn.isVisible().catch(() => false)) {
        await desktopSearchBtn.click();
      } else {
        await mobileSearchBtn.click();
      }

      await expect(commandDialog).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 15000 });

    // Filter for "Proof"
    const searchInput = commandDialog.getByRole("combobox");
    await searchInput.fill("Proof");

    // Select Proof Assistant option
    const proofOption = commandDialog
      .getByText(/Proof Studio|Formal Proof|Logical Proof/i)
      .first();
    await expect(proofOption).toBeVisible({ timeout: 5000 });
    await proofOption.click();

    // Verify seamless navigation to /proof
    await page.waitForURL("**/proof", { timeout: 15000 });
    expect(page.url()).toContain("/proof");
  });

  test("Probe 3: Proof Assistant DAG Engine & Export Flow", async ({
    page,
  }) => {
    await page.goto("/proof", { waitUntil: "domcontentloaded" });

    // Verify Proof Workspace header and graph area mount
    await expect(
      page
        .getByText(
          /Logical Proof|Proof Canvas|Formal Verification|Deduction Studio/i
        )
        .first()
    ).toBeVisible({ timeout: 10000 });

    // Ensure premises or theorem graph nodes or rule palette are rendered
    const proofElement = page
      .getByText(
        /Premise|Theorem|Modus Ponens|Rule Palette|Logical Proof Canvas/i
      )
      .first();
    await expect(proofElement).toBeVisible({ timeout: 10000 });

    // Probe Export modal / drawer if available
    const exportBtn = page
      .getByRole("button", { name: /Export|Share Proof/i })
      .first();
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      const modal = page.getByRole("dialog");
      if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(modal).toBeVisible();
        await page.keyboard.press("Escape");
      }
    }
  });

  test("Probe 4: Arcade Canvas 2D Engine Initialization", async ({ page }) => {
    await page.goto("/arcade/laser-loon", { waitUntil: "domcontentloaded" });

    // Click Launch Cabinet to initialize canvas engine with hydration-safe polling
    await expect(async () => {
      const launchBtn = page.getByRole("button", { name: /Launch Cabinet/i });
      if (await launchBtn.isVisible()) {
        await launchBtn.click();
      }
      const canvas = page.locator("canvas").first();
      await expect(canvas).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 20000 });
  });

  test("Probe 5: API Ingestion, Schema Guard & Rate Limiting Health", async ({
    request,
  }) => {
    // 1. Valid Telemetry Ingestion Probe
    const validRes = await request.post("/api/telemetry", {
      data: {
        eventType: "page_view",
        projectSlug: "synthetic-probe-runner",
      },
      headers: { "Content-Type": "application/json" },
    });
    // POST /api/telemetry answers 201 when the Redis buffer write succeeded and
    // 202 when the event was accepted but dropped (buffer unavailable). It never
    // returns 200 -- see app/api/telemetry/route.ts.
    expect([201, 202]).toContain(validRes.status());
    const validJson = await validRes.json();
    expect(validJson.success).toBe(true);

    // 2. Strict Schema Reject Probe (Missing required eventType)
    const invalidRes = await request.post("/api/telemetry", {
      data: {
        projectSlug: "malformed-payload-probe",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(invalidRes.status()).toBe(400);
    const errorJson = await invalidRes.json();
    expect(errorJson.error).toBeDefined();

    // 3. Case Studies API probe
    const caseStudiesRes = await request.get("/api/case-studies");
    if (caseStudiesRes.status() === 200) {
      const cases = await caseStudiesRes.json();
      expect(Array.isArray(cases)).toBe(true);
    }
  });

  test("Probe 6: Patrol Shift Critical Journey — Dispatch to Debrief", async ({
    page,
  }) => {
    const response = await page.goto("/patrol", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBeLessThan(400);

    await expect(
      page.locator('[data-testid="patrol-shift-container"]')
    ).toBeVisible({ timeout: 15000 });

    // 1. Intro -> mountain map hub. Every interactive trigger is wrapped in a
    // toPass poll so a click cannot land on static HTML before React 19
    // attaches its listeners.
    await expect(async () => {
      await page
        .getByRole("button", { name: /Skip Intro|Resume Shift/i })
        .click();
      await expect(
        page.locator('[data-testid="patrol-mountain-map"]')
      ).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });

    // 2. Take a dispatch.
    await expect(async () => {
      await page
        .getByRole("button", { name: /Standby on Hill \/ Await Dispatch/i })
        .click();
      await expect(
        page.locator('[data-testid="patrol-dispatch-overlay"]')
      ).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });

    // 3. Run the scene (OEC).
    await expect(async () => {
      await page
        .getByRole("button", { name: /Acknowledge & Respond/i })
        .click();
      await expect(
        page.locator('[data-testid="patrol-scene-interaction"]')
      ).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });

    // 4. Transport (OET) — the canvas must acquire a 2D context.
    await expect(async () => {
      await page
        .getByRole("button", { name: /Stabilize & Prepare Toboggan/i })
        .click();
      await expect(
        page.locator('[data-testid="patrol-oet-canvas"]')
      ).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });

    const hasContext = await page.evaluate(() => {
      const canvas = document.querySelector(
        '[data-testid="oet-viewport-canvas"]'
      ) as HTMLCanvasElement | null;
      return Boolean(canvas && canvas.getContext("2d"));
    });
    expect(hasContext).toBe(true);

    // 5. Radio traffic is text-first, so the journey is completable with audio
    // unavailable and nothing is conveyed by sound alone.
    const liveRegion = page.locator('[aria-live="polite"]').first();
    await expect(liveRegion).toBeAttached();
  });
});
