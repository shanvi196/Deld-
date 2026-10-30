import { test, expect } from '@playwright/test';

test('Add restaurant to comparison from card', async ({ page }) => {
  await page.goto('http://localhost:3000?query=&location=&page=1');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  const compareButton = page.getByTestId('compare-hours-button-rest_0001');
  await expect(compareButton).toBeVisible();

  await compareButton.click();

  const stored = await page.evaluate(() => localStorage.getItem('hoursComparison'));
  expect(stored).toBeTruthy();
  const data = JSON.parse(stored!);
  expect(data).toContain('rest_0001');

  const sidebar = page.getByTestId('hours-comparison-sidebar');
  await expect(sidebar).toBeVisible();

  const items = page.getByTestId('comparison-restaurant-item');
  await expect(items).toHaveCount(1);
});
