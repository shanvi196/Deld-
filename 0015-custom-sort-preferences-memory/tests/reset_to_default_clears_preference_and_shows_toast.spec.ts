import { test, expect } from '@playwright/test';

test('Reset to Default clears preference and shows toast', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    localStorage.setItem('deld-sort-memory', JSON.stringify({ home: 'highest-rated' }));
  });
  await page.reload();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1000);
  
  const sortDropdownTrigger= page.locator('[data-testid="sort-dropdown-trigger"]');
  await expect(sortDropdownTrigger).toContainText('Highest Rated');
  
  await sortDropdownTrigger.click();
  await page.waitForTimeout(500);
  
  const resetOption = page.locator('[data-testid="sort-reset-to-default"]')
  await expect(resetOption).toBeVisible();
  await resetOption.click();
  await page.waitForTimeout(1000);
  
  await expect(sortDropdownTrigger).toContainText('Recommended');
  
  const localStorageValue = await page.evaluate(() => {
    const stored = localStorage.getItem('deld-sort-memory');
    return stored ? JSON.parse(stored) : {};
  });
  expect(localStorageValue.home).toBeUndefined();
  
  const toast = page.locator('[data-testid="sort-reset-toast"]');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('Sort reset to default');
});