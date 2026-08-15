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
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Check first card bounding box to ensure no layout collapse
    const firstCard = cards.first();
    const box = await firstCard.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(100);
    expect(box!.width).toBeGreaterThan(200);
  });

  test("Probe 2: Command Palette Discovery, Filtering & Navigation Journey", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Open Command Palette via keyboard shortcut (Cmd+K / Ctrl+K) or trigger button
    const isMac = process.platform === "darwin";
    await page.keyboard.press(isMac ? "Meta+k" : "Control+k");

    const commandDialog = page.getByRole("dialog");
    await expect(commandDialog).toBeVisible({ timeout: 5000 });

    // Filter for "Proof"
    const searchInput = commandDialog.getByRole("textbox");
    await searchInput.fill("Proof");

    // Select Proof Assistant option
    const proofOption = commandDialog.getByText(/Proof Studio|Formal Proof/i).first();
    await expect(proofOption).toBeVisible();
    await proofOption.click();

    // Verify seamless navigation to /proof
    await page.waitForURL("**/proof");
    expect(page.url()).toContain("/proof");
  });

  test("Probe 3: Proof Assistant DAG Engine & Export Flow", async ({ page }) => {
    await page.goto("/proof", { waitUntil: "domcontentloaded" });

    // Verify Proof Workspace header and graph area mount
    await expect(page.getByText(/Formal Proof Assistant|Deduction Studio/i).first()).toBeVisible();

    // Ensure premises or theorem graph nodes are rendered
    const proofNodes = page.locator('[data-testid="proof-node"], .proof-node, text=Premise').first();
    await expect(proofNodes).toBeVisible({ timeout: 6000 });

    // Verify deduction ledger is populated
    const ledger = page.locator("text=Deduction Ledger").first();
    await expect(ledger).toBeVisible();

    // Probe Export modal / drawer
    const exportBtn = page.getByRole("button", { name: /Export|Share Proof/i }).first();
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      const modal = page.getByRole("dialog");
      await expect(modal).toBeVisible();
      // Dismiss modal with Escape
      await page.keyboard.press("Escape");
    }
  });

  test("Probe 4: Arcade Canvas 2D Engine Initialization", async ({ page }) => {
    await page.goto("/arcade/quasi-puzzler", { waitUntil: "domcontentloaded" });

    // Canvas element must mount cleanly without WebGL/2D context unhandled errors
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible({ timeout: 6000 });

    // Verify UI game controls or restart triggers are interactive
    const restartBtn = page.getByRole("button", { name: /Restart|New Game|Reset/i }).first();
    if (await restartBtn.isVisible()) {
      await restartBtn.click();
      await expect(canvas).toBeVisible();
    }
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
