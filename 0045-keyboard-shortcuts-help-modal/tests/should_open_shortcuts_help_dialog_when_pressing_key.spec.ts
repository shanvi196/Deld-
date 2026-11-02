import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Keyboard Shortcuts Help Modal', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should open shortcuts help dialog when pressing ? key', async ({ page }) => {
    const shortcutsDialog = page.getByTestId('shortcuts-help-dialog');
    await expect(shortcutsDialog).not.toBeVisible();

    await page.keyboard.press('?');

    await expect(shortcutsDialog).toBeVisible();

    const shortcutItems = page.getByTestId('shortcut-item');
    await expect(shortcutItems).toHaveCount(4);
  });
});