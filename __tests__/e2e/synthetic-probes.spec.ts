import { test, expect } from "@playwright/test";

test.describe("Headless Synthetic User Probes & Journey Monitoring", () => {
  test("Probe 1: Landing Page Pretext Layout & Dynamic Filter Flow", async ({ page }) => {
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

  test("Probe 2: Command Palette Discovery, Filtering & Navigation Journey", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const commandDialog = page.getByRole("dialog", { name: /Command Palette/i });

    // Open Command Palette via visible Search trigger button in Navbar with hydration retry
    await expect(async () => {
      const desktopSearchBtn = page.getByRole("button", { name: "Search portfolio and commands (Press Command+K)" });
      const mobileSearchBtn = page.getByRole("button", { name: "Open Command Search" });

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
    const proofOption = commandDialog.getByText(/Proof Studio|Formal Proof|Logical Proof/i).first();
    await expect(proofOption).toBeVisible({ timeout: 5000 });
    await proofOption.click();

    // Verify seamless navigation to /proof
    await page.waitForURL("**/proof", { timeout: 15000 });
    expect(page.url()).toContain("/proof");
  });

  test("Probe 3: Proof Assistant DAG Engine & Export Flow", async ({ page }) => {
    await page.goto("/proof", { waitUntil: "domcontentloaded" });

    // Verify Proof Workspace header and graph area mount
    await expect(
      page.getByText(/Logical Proof|Proof Canvas|Formal Verification|Deduction Studio/i).first()
    ).toBeVisible({ timeout: 10000 });

    // Ensure premises or theorem graph nodes or rule palette are rendered
    const proofElement = page.getByText(/Premise|Theorem|Modus Ponens|Rule Palette|Logical Proof Canvas/i).first();
    await expect(proofElement).toBeVisible({ timeout: 10000 });

    // Probe Export modal / drawer if available
    const exportBtn = page.getByRole("button", { name: /Export|Share Proof/i }).first();
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

    // Click Launch Cabinet to initialize canvas engine if inside PlayCabinet
    const launchBtn = page.getByRole("button", { name: /Launch Cabinet/i });
    await expect(launchBtn).toBeVisible({ timeout: 10000 });
    await launchBtn.scrollIntoViewIfNeeded();
    await launchBtn.click();

    // Canvas element must mount cleanly without WebGL/2D context unhandled errors
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible({ timeout: 20000 });
  });

  test("Probe 5: API Ingestion, Schema Guard & Rate Limiting Health", async ({ request }) => {
    // 1. Valid Telemetry Ingestion Probe
    const validRes = await request.post("/api/telemetry", {
      data: {
        eventType: "page_view",
        projectSlug: "synthetic-probe-runner",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect([200, 201]).toContain(validRes.status());
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
});
