import { test, expect } from '@playwright/test';

test.describe('Cuisine Theme Switcher - Theme Restoration', () => {
  test('saved theme is restored on page reload', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    await page.evaluate(() => localStorage.setItem('cuisine-theme', 'japanese'));
    
    await page.reload();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'japanese');
  });
});