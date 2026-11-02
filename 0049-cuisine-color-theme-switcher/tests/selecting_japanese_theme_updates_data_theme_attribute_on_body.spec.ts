import { test, expect } from '@playwright/test';

test.describe('Cuisine Theme Switcher - Japanese Theme', () => {
  test('selecting Japanese theme updates data-theme attribute on body', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    const trigger = page.getByTestId('theme-switcher-trigger');
    await trigger.click();
    
    await page.waitForTimeout(500);
    
    const japaneseOption = page.getByTestId('theme-option-japanese');
    await japaneseOption.click();
    
    await page.waitForTimeout(500);
    
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'japanese');
  });
});