import { test, expect } from '@playwright/test'

test('invalid_localstorage_value_falls_back_to_default_sort', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'deld-sort-memory',
      JSON.stringify({ home: 'invalid-sort-option' })
    );
  });
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
 
  const sortDropdownTrigger = page.locator('[data-testid="sort-dropdown-trigger"]');
  
  await expect(sortDropdownTrigger).toBeVisible();
  await expect(sortDropdownTrigger).toContainText('Recommended');
  
  expect(page.url()).not.toContain('sort=invalid-sort-option');
  
  const localStorageValue = await page.evaluate(() => {
    const stored = localStorage.getItem('deld-sort-memory');
    return stored ? JSON.parse(stored) : {};
  });
  expect(localStorageValue.home).toBe('invalid-sort-option');
});