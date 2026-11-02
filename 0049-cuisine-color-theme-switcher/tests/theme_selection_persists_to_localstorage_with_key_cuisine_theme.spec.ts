import { test, expect } from '@playwright/test';

test.describe('Cuisine Theme Switcher - LocalStorage Persistence', () => {
  test('theme selection persists to localStorage with key cuisine-theme', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    const trigger = page.getByTestId('theme-switcher-trigger');
    await trigger.click();
    
    await page.waitForTimeout(500);
    
    const mexicanOption = page.getByTestId('theme-option-mexican');
    await mexicanOption.click();
    
    await page.waitForTimeout(500);
    
    const storedTheme = await page.evaluate(() => localStorage.getItem('cuisine-theme'));
    expect(storedTheme).toBe('mexican');
  });
});