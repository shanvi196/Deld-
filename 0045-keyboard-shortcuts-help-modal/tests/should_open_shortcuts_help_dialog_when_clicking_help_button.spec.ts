import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Keyboard Shortcuts Help Modal', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should open shortcuts help dialog when clicking help button', async ({ page }) => {
    const shortcutsDialog = page.getByTestId('shortcuts-help-dialog');
    await expect(shortcutsDialog).not.toBeVisible();

    const helpButton = page.getByTestId('help-button');
    await expect(helpButton).toBeVisible();
    await helpButton.click();

    await expect(shortcutsDialog).toBeVisible();

    const dialogTitle = page.getByRole('heading', { name: 'Keyboard Shortcuts' });
    await expect(dialogTitle).toBeVisible();

    const shortcutItems = page.getByTestId('shortcut-item');
    await expect(shortcutItems).toHaveCount(4);
  });
});