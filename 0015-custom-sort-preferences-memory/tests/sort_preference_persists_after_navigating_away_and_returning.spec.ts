import { test, expect } from '@playwright/test';

test('Sort preference persists after navigating away and returning', async ({ page }) => {
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
  await sortDropdownTrigger.click();
  await page.waitForTimeout(500);
  
  const newestOption = page.locator('[data-testid="sort-option-newest"]');
  await newestOption.click();
  await page.waitForTimeout(1000);
  
  await page.goto('http://localhost:3000/restaurants/58ee178b-40b8-442b-990e-6782aca05b72');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1000);
  
  expect(page.url()).toContain('/restaurants/');
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1000);
  
  await expect(sortDropdownTrigger).toContainText('Newest');
  
  const localStorageValue = await page.evaluate(() => {
    const stored = localStorage.getItem('deld-sort-memory');
    return stored ? JSON.parse(stored) : null;
  });
  expect(localStorageValue).toEqual({ home: 'newest' });
});