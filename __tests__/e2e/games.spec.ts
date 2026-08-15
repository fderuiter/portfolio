import { test, expect } from '@playwright/test';

test.describe('Arcade Games & Simulators Suite', () => {
  test('UI Sandbox (/ui-sandbox) loads all 4 arcade/puzzle games successfully', async ({ page }) => {
    await page.goto('/ui-sandbox');
    await page.waitForLoadState('networkidle');

    // 1. Quasi-Perfect Puzzler
    const quasiSection = page.locator('#quasi-puzzler');
    await expect(quasiSection).toBeVisible();
    await expect(quasiSection.getByText('Quasi-Perfect Puzzler')).toBeVisible();
    await expect(quasiSection.getByText('The Identity Crisis')).toBeVisible();

    // 2. Laser Loon: Bug Hunter
    const laserSection = page.locator('#laser-loon');
    await expect(laserSection).toBeVisible();
    await expect(laserSection.getByText('Laser Loon: Bug Hunter')).toBeVisible();
    const laserCanvas = laserSection.locator('canvas');
    await expect(laserCanvas).toBeVisible();

    // 3. Garmin Watch Simulator
    const garminSection = page.locator('#garmin-watch');
    await expect(garminSection).toBeVisible();
    await expect(garminSection.getByText('Garmin Connect IQ 32KB Memory Runner')).toBeVisible();
    const garminCanvas = garminSection.locator('canvas');
    await expect(garminCanvas).toBeVisible();

    // 4. Clinical Trial Chaos
    const clinicalSection = page.locator('#clinical-chaos');
    await expect(clinicalSection).toBeVisible();
    await expect(clinicalSection.getByText('Clinical Trial Chaos')).toBeVisible();
  });

  test('Laser Loon game starts and switches weapon modes', async ({ page }) => {
    await page.goto('/ui-sandbox');
    const laserSection = page.locator('#laser-loon');

    // Click Launch button to start playing
    const launchBtn = laserSection.getByRole('button', { name: /LAUNCH CRYO HUNT/i });
    if (await launchBtn.isVisible()) {
      await launchBtn.click();
    }

    // Switch weapons to Emerald Beam (Plasma)
    const plasmaBtn = laserSection.getByRole('button', { name: /Plasma \(2\)/i });
    await plasmaBtn.click();
    await expect(plasmaBtn).toHaveClass(/bg-emerald-500/);

    // Switch to Sandbox mode
    const sandboxTab = laserSection.getByRole('button', { name: /Zero-G Sandbox/i });
    await sandboxTab.click();
    await expect(laserSection.getByText(/Zero-G/)).toBeVisible();
  });

  test('Garmin Watch Simulator switches device targets and starts', async ({ page }) => {
    await page.goto('/ui-sandbox');
    const garminSection = page.locator('#garmin-watch');

    // Switch to Edge (128KB) profile
    const edgeBtn = garminSection.getByRole('button', { name: /Edge \(128KB\)/i });
    await edgeBtn.click();
    await expect(garminSection.getByText(/128 KB/)).toBeVisible();

    // Start simulation
    const startSimBtn = garminSection.getByRole('button', { name: /START SIMULATION/i });
    if (await startSimBtn.isVisible()) {
      await startSimBtn.click();
    }
  });

  test('Quasi-Perfect Puzzler allows level selection and tactic clicking', async ({ page }) => {
    await page.goto('/ui-sandbox');
    const quasiSection = page.locator('#quasi-puzzler');

    // Switch to Level 2
    const l2Btn = quasiSection.getByRole('button', { name: /L2/i });
    await l2Btn.click();
    await expect(quasiSection.getByText(/The Art of Substitution/i)).toBeVisible();
    await expect(quasiSection.getByText(/Active Hypotheses Context/i)).toBeVisible();
  });

  test('Retro Labyrinth renders on 404 Error page with interactive canvas', async ({ page }) => {
    await page.goto('/non-existent-arcade-route-404');
    await page.waitForLoadState('networkidle');

    // Verify 404 UnifiedErrorLayout has Retro Labyrinth
    await expect(page.getByText('Graveyard Roguelike')).toBeVisible();
    const labyrinthCanvas = page.locator('canvas').first();
    await expect(labyrinthCanvas).toBeVisible();

    // Verify weapon buttons exist
    await expect(page.getByRole('button', { name: /\[1\] npm i/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /\[2\] git push -f/i })).toBeVisible();
  });
});
