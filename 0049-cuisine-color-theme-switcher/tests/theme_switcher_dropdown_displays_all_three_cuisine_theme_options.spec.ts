import { test, expect } from '@playwright/test';

test.describe('Cuisine Theme Switcher - Dropdown Options', () => {
  test('theme switcher dropdown displays all cuisine theme options', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const trigger = page.getByTestId('theme-switcher-trigger');
    await expect(trigger).toBeVisible();
    await trigger.click();

    const menu = page.getByTestId('theme-switcher-menu');
    await expect(menu).toBeVisible();

    const themeOptions = menu.locator('[data-testid^="theme-option-"]');
    await expect(themeOptions).toHaveCount(4); // ✅ Default + Italian + Japanese + Mexican

    await expect(page.getByTestId('theme-option-default')).toBeVisible();
    await expect(page.getByTestId('theme-option-italian')).toBeVisible();
    await expect(page.getByTestId('theme-option-japanese')).toBeVisible();
    await expect(page.getByTestId('theme-option-mexican')).toBeVisible();
  });
});
