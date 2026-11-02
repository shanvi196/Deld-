import { test, expect } from '@playwright/test';

test('URL sort parameter takes precedence over localStorage preference', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    localStorage.setItem('deld-sort-memory', JSON.stringify({ home: 'highest-rated' }));
  });
  
  await page.goto('http://localhost:3000?sort=most-reviewed');
  await page.waitForTimeout(500);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  
  const sortDropdownTrigger = page.locator('[data-testid="sort-dropdown-trigger"]');
  await expect(sortDropdownTrigger).toBeVisible();
  await expect(sortDropdownTrigger).toContainText(/Most Reviewed/i);
  
  const localStorageValue = await page.evaluate(() => {
    const stored = localStorage.getItem('deld-sort-memory');
    return stored ? JSON.parse(stored) : null;
  });
  expect(localStorageValue).toEqual({ home: 'highest-rated' });
});