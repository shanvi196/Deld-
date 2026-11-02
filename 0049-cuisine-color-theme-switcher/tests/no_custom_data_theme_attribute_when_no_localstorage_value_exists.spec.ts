import { test, expect } from '@playwright/test';

test.describe('Cuisine Theme Switcher - Default Theme', () => {
  test('no custom data-theme attribute when no localStorage value exists', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => localStorage.removeItem('cuisine-theme'));
    
    await page.reload();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    const bodyTheme = await page.locator('body').getAttribute('data-theme');
    expect(bodyTheme).toBeNull();
  });
});