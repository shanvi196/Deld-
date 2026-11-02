import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Keyboard Shortcuts Help Modal', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should maintain dialog state correctly when navigating between pages', async ({ page }) => {
    const shortcutsDialog = page.getByTestId('shortcuts-help-dialog');

    await page.keyboard.press('?');
    await expect(shortcutsDialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(shortcutsDialog).not.toBeVisible();

    await page.goto('http://localhost:3000/?q=test');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    await expect(shortcutsDialog).not.toBeVisible();

    await page.keyboard.press('?');
    await expect(shortcutsDialog).toBeVisible();

    const shortcutItems = page.getByTestId('shortcut-item');
    await expect(shortcutItems).toHaveCount(4);
  });
});