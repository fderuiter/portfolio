import { test, expect } from '@playwright/test';

test.describe('Arcade Games & Simulators Suite', () => {
  test('Arcade Hub (/arcade) loads all arcade/puzzle games successfully', async ({ page }) => {
    await page.goto('/arcade');
    await page.waitForLoadState('networkidle');

    // 1. Quasi-Perfect Puzzler
    await expect(page.getByText('Quasi-Perfect Puzzler')).toBeVisible();

    // 2. Laser Loon: Bug Hunter
    await expect(page.getByText('Laser Loon')).toBeVisible();

    // 3. Garmin Watch Simulator
    await expect(page.getByText('Garmin 32KB Memory Runner')).toBeVisible();

    // 4. Clinical Trial Chaos
    await expect(page.getByText('Clinical Trial Chaos')).toBeVisible();

    // 5. Retro Labyrinth
    await expect(page.getByText('Retro Labyrinth')).toBeVisible();

    // 6. Working With Duck
    await expect(page.getByText('Working With Duck')).toBeVisible();
  });

  test('Laser Loon dedicated game starts and switches weapon modes', async ({ page }) => {
    await page.goto('/arcade/laser-loon');
    await page.waitForLoadState('networkidle');

    // Laser canvas exists
    const laserCanvas = page.locator('canvas').first();
    await expect(laserCanvas).toBeVisible();

    // Click Launch button to start playing
    const launchBtn = page.getByRole('button', { name: /LAUNCH CRYO HUNT/i });
    if (await launchBtn.isVisible()) {
      await launchBtn.click();
    }

    // Switch weapons to Emerald Beam (Plasma)
    const plasmaBtn = page.getByRole('button', { name: /Plasma \(2\)/i });
    await plasmaBtn.click();
    await expect(plasmaBtn).toHaveClass(/bg-emerald-500/);

    // Switch to Sandbox mode
    const sandboxTab = page.getByRole('button', { name: /Zero-G Sandbox/i });
    await sandboxTab.click();
    await expect(page.getByText(/Zero-G/)).toBeVisible();
  });

  test('Garmin Watch Simulator switches device targets and starts', async ({ page }) => {
    await page.goto('/arcade/garmin-watch');
    await page.waitForLoadState('networkidle');

    const garminCanvas = page.locator('canvas').first();
    await expect(garminCanvas).toBeVisible();

    // Switch to Edge (128KB) profile
    const edgeBtn = page.getByRole('button', { name: /Edge \(128KB\)/i });
    await edgeBtn.click();
    await expect(page.getByText(/128 KB/)).toBeVisible();

    // Start simulation
    const startSimBtn = page.getByRole('button', { name: /START SIMULATION/i });
    if (await startSimBtn.isVisible()) {
      await startSimBtn.click();
    }
  });

  test('Quasi-Perfect Puzzler allows level selection and tactic clicking', async ({ page }) => {
    await page.goto('/arcade/quasi-puzzler');
    await page.waitForLoadState('networkidle');

    // Switch to Level 2
    const l2Btn = page.getByRole('button', { name: /L2/i });
    await l2Btn.click();
    await expect(page.getByText(/The Art of Substitution/i)).toBeVisible();
    await expect(page.getByText(/Active Hypotheses Context/i)).toBeVisible();
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
