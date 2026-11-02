import { test, expect } from '@playwright/test';

test('Saved sort preference is auto-applied on page load', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    localStorage.setItem('deld-sort-memory', JSON.stringify({ home: 'most-reviewed' }));
  });
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1000);
  
  const sortDropdownTrigger = page.locator('[data-testid="sort-dropdown-trigger"]')
  await expect(sortDropdownTrigger).toBeVisible();
  await expect(sortDropdownTrigger).toContainText('Most Reviewed');
  
  await page.waitForTimeout(1000);
  expect(page.url()).toContain('sort=most-reviewed');
});