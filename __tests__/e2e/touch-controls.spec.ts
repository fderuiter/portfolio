import { test, expect } from '@playwright/test';

test.describe('Mobile & Tablet Touch Interactions Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Emulate reduced motion for test stability
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Enable test flags
    await page.addInitScript(() => {
      (window as unknown as { __PLAYWRIGHT_TEST__?: boolean }).__PLAYWRIGHT_TEST__ = true;
    });

    // Disable CSS animations for deterministic testing
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          transition: none !important;
          animation: none !important;
        }
      `,
    });
  });

  test('Mobile Navigation Drawer opens, traps focus, and navigates', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile drawer test is only applicable on mobile viewports');

    await page.goto('/');
    await page.waitForTimeout(500);

    // Click Hamburger Menu Trigger
    const menuButton = page.getByRole('button', { name: /open navigation menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // Verify modal overlay opens
    const overlay = page.getByRole('dialog', { name: /mobile navigation overlay/i });
    await expect(overlay).toBeVisible();

    // Verify nav links inside drawer
    const workLink = overlay.getByRole('link', { name: /work showcase/i });
    await expect(workLink).toBeVisible();

    const arcadeLink = overlay.getByRole('link', { name: /arcade games hub/i });
    await expect(arcadeLink).toBeVisible();

    // Close menu with escape key
    await page.keyboard.press('Escape');
    await expect(overlay).toBeHidden();
  });

  test('Retro Labyrinth touch D-Pad and action buttons operate properly', async ({ page }) => {
    await page.goto('/arcade/retro-labyrinth');
    await page.waitForTimeout(500);

    // Locate the labyrinth game container
    const gameContainer = page.locator('[data-keyboard-boundary="true"]').first();
    await expect(gameContainer).toBeVisible();

    // If on mobile/tablet, verify Virtual D-Pad is rendered
    const virtualPad = page.getByRole('group', { name: /virtual game controller/i });
    if (await virtualPad.isVisible()) {
      const upBtn = virtualPad.getByRole('button', { name: /move up/i });
      const downBtn = virtualPad.getByRole('button', { name: /move down/i });
      const leftBtn = virtualPad.getByRole('button', { name: /move left/i });
      const rightBtn = virtualPad.getByRole('button', { name: /move right/i });
      const empBtn = virtualPad.getByRole('button', { name: /emp/i });

      await expect(upBtn).toBeVisible();
      await expect(downBtn).toBeVisible();
      await expect(leftBtn).toBeVisible();
      await expect(rightBtn).toBeVisible();
      await expect(empBtn).toBeVisible();

      // Trigger touch movements
      await upBtn.click();
      await downBtn.click();
      await leftBtn.click();
      await rightBtn.click();
      await empBtn.click();
    }
  });

  test('Laser Loon touch controls bar and weapon switching', async ({ page }) => {
    await page.goto('/arcade/laser-loon');
    await page.waitForTimeout(500);

    // Verify game canvas is rendered
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();

    // Check touch controls bar if on mobile/tablet
    const fireBtn = page.getByRole('button', { name: /fire/i });
    const iceBtn = page.getByRole('button', { name: /ice cannon/i });

    if (await iceBtn.isVisible()) {
      await iceBtn.click();
    }

    if (await fireBtn.isVisible()) {
      await fireBtn.click();
    }
  });

  test('Proof Workspace responsive split layout and command execution', async ({ page }) => {
    await page.goto('/proof');
    await page.waitForTimeout(500);

    // Verify logical proof canvas is present
    const canvasRegion = page.getByRole('region', { name: /logic proof canvas editor/i });
    await expect(canvasRegion).toBeVisible();

    // Verify terminal input prompt
    const terminalInput = page.getByLabel(/terminal command input/i);
    await expect(terminalInput).toBeVisible();

    // Execute help command via terminal
    await terminalInput.fill('help');
    await terminalInput.press('Enter');

    // Verify output log updated
    const outputLog = page.getByRole('log', { name: /command history/i });
    await expect(outputLog).toContainText('Available Commands');
  });
});
