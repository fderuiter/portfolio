import { test, expect } from '@playwright/test';

test.describe('Arcade Games & Simulators Suite', () => {
  test('Arcade Hub (/arcade) loads all arcade/puzzle games successfully', async ({ page }) => {
    await page.goto('/arcade');
    await page.waitForLoadState('networkidle');

    // 1. Quasi-Perfect Puzzler
    await expect(page.getByRole('heading', { name: /Quasi-Perfect Puzzler/i }).first()).toBeVisible();

    // 2. Laser Loon: Bug Hunter
    await expect(page.getByRole('heading', { name: /Laser Loon/i }).first()).toBeVisible();

    // 3. Garmin Watch Simulator
    await expect(page.getByRole('heading', { name: /Garmin/i }).first()).toBeVisible();

    // 4. Clinical Trial Chaos
    await expect(page.getByRole('heading', { name: /Clinical Trial Chaos/i }).first()).toBeVisible();

    // 5. Retro Labyrinth
    await expect(page.getByRole('heading', { name: /Retro Labyrinth/i }).first()).toBeVisible();

    // 6. Working With Duck
    await expect(page.getByRole('heading', { name: /Working With Duck/i }).first()).toBeVisible();
  });

  test('Laser Loon dedicated game starts and switches weapon modes', async ({ page }) => {
    await page.goto('/arcade/laser-loon');
    await page.waitForLoadState('networkidle');

    // Click Launch Cabinet button to mount/start the game
    const launchCabinetBtn = page.getByRole('button', { name: /Launch Cabinet/i });
    await expect(launchCabinetBtn).toBeVisible();
    await launchCabinetBtn.click();

    // Laser canvas exists after launch warming up
    const laserCanvas = page.locator('canvas').first();
    await expect(laserCanvas).toBeVisible({ timeout: 15000 });

    // Switch weapons to Emerald Beam (Aurora)
    const auroraBtn = page.getByRole('button', { name: /Aurora \(3\)/i });
    await auroraBtn.click();
    await expect(auroraBtn).toHaveClass(/bg-emerald-500/);

    // Switch to Sandbox mode
    const sandboxTab = page.getByRole('button', { name: /Zero-G Sandbox/i });
    await sandboxTab.click();
    await expect(page.getByRole('button', { name: 'Zero-G', exact: true })).toBeVisible();
  });

  test('Garmin Watch Simulator switches device targets and starts', async ({ page }) => {
    await page.goto('/arcade/garmin-watch');
    await page.waitForLoadState('networkidle');

    // Click Launch Cabinet button to mount/start the game
    const launchCabinetBtn = page.getByRole('button', { name: /Launch Cabinet/i });
    await expect(launchCabinetBtn).toBeVisible();
    await launchCabinetBtn.click();

    const garminCanvas = page.locator('canvas').first();
    await expect(garminCanvas).toBeVisible({ timeout: 15000 });

    // Switch to Edge (128KB) profile
    const edgeBtn = page.getByRole('button', { name: /Edge \(128KB\)/i });
    await edgeBtn.click();
    await expect(page.getByText('LIMIT: 128 KB RAM').first()).toBeVisible();

    // Start simulation
    const startSimBtn = page.getByRole('button', { name: /START SIMULATION/i });
    if (await startSimBtn.isVisible()) {
      await startSimBtn.click();
    }
  });

  test('Quasi-Perfect Puzzler allows level selection and tactic clicking', async ({ page }) => {
    await page.goto('/arcade/quasi-puzzler');
    await page.waitForLoadState('networkidle');

    // Click Launch Cabinet button to mount/start the game
    const launchCabinetBtn = page.getByRole('button', { name: /Launch Cabinet/i });
    await expect(launchCabinetBtn).toBeVisible();
    await launchCabinetBtn.click();

    // Switch to Level 2
    const l2Btn = page.getByRole('button', { name: /L2/i });
    await expect(l2Btn).toBeVisible({ timeout: 15000 });
    await l2Btn.click();
    await expect(page.getByRole('heading', { name: 'The Mirror Law' })).toBeVisible();
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
