import { test, expect } from '@playwright/test';

test('Navigate to full comparison page from sidebar', async ({ page }) => {
  await page.goto('http://localhost:3000?query=&location=&page=1');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    localStorage.setItem('hoursComparison', JSON.stringify(['rest_0001', 'rest_0002', 'rest_0003']));
  });

  await page.reload();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  const sidebar = page.getByTestId('hours-comparison-sidebar');
  await expect(sidebar).toBeVisible();

  const viewFullButton = page.getByTestId('view-full-comparison-button');
  await viewFullButton.click();

  await page.waitForURL('**/compare-hours');
  expect(page.url()).toContain('/compare-hours');

  const stored = await page.evaluate(() => localStorage.getItem('hoursComparison'));
  const data = JSON.parse(stored!);
  expect(data.length).toBe(3);

  const table = page.locator('table, [role="table"], [data-testid*="comparison-table"]').first();
  await expect(table).toBeVisible();

  const columns = page.locator('th, [role="columnheader"], [data-testid*="restaurant-column"]');
  await expect(columns).toHaveCount(4, { timeout: 5000 });
});
