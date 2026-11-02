import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Keyboard Shortcuts Help Modal', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display correct shortcut items with keys and descriptions', async ({ page }) => {
    await page.keyboard.press('?');

    const shortcutsDialog = page.getByTestId('shortcuts-help-dialog');
    await expect(shortcutsDialog).toBeVisible();

    const shortcutItems = page.getByTestId('shortcut-item');
    await expect(shortcutItems).toHaveCount(4);

    const firstItem = shortcutItems.nth(0);
    const firstKey = firstItem.getByTestId('shortcut-key');
    await expect(firstKey).toHaveText('/');
    await expect(firstItem).toContainText('Focus search');

    const secondItem = shortcutItems.nth(1);
    const secondKey = secondItem.getByTestId('shortcut-key');
    await expect(secondKey).toHaveText('Esc');
    await expect(secondItem).toContainText('Close modals');

    const thirdItem = shortcutItems.nth(2);
    const thirdKey = thirdItem.getByTestId('shortcut-key');
    await expect(thirdKey).toHaveText('j');
    await expect(thirdItem).toContainText('Navigate down in list');

    const fourthItem = shortcutItems.nth(3);
    const fourthKey = fourthItem.getByTestId('shortcut-key');
    await expect(fourthKey).toHaveText('k');
    await expect(fourthItem).toContainText('Navigate up in list');
  });
});