import { test, expect } from '@playwright/test';

test('Sort preference is saved to localStorage when changed', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  
  const sortDropdownTrigger = page.locator('[data-testid="sort-dropdown-trigger"]');
  await expect(sortDropdownTrigger).toBeVisible();
  await expect(sortDropdownTrigger).toContainText('Recommended');
  
  await sortDropdownTrigger.click();
  await page.waitForTimeout(500);
  
  const highestRatedOption= page.locator('[data-testid="sort-option-highest-rated"]');
  await highestRatedOption.click();
  await page.waitForTimeout(1000);
  
  const localStorageValue = await page.evaluate(() => {
    const stored = localStorage.getItem('deld-sort-memory');
    return stored ? JSON.parse(stored) : null;
  });
  expect(localStorageValue).toEqual({ home: 'highest-rated' });
  
  const toast = page.getByTestId('sort-saved-toast');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('Sort preference saved');
});