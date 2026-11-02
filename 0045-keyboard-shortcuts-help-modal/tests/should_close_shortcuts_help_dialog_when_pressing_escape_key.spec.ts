import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Keyboard Shortcuts Help Modal', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should close shortcuts help dialog when pressing Escape key', async ({ page }) => {
    const shortcutsDialog = page.getByTestId('shortcuts-help-dialog');

    await page.keyboard.press('?');
    await expect(shortcutsDialog).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(shortcutsDialog).not.toBeVisible();

    const body = page.locator('body');
    await expect(body).not.toHaveAttribute('aria-hidden', 'true');
  });
});