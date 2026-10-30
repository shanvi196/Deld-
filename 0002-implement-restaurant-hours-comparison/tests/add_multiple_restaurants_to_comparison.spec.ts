import { test, expect } from '@playwright/test';

test('Add multiple restaurants to comparison', async ({ page }) => {
  await page.goto('http://localhost:3000?query=&location=&page=1');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.evaluate(() => localStorage.removeItem('hoursComparison'));

  await page.getByTestId('compare-hours-button-rest_0001').click();
  await page.waitForTimeout(300);

  await page.getByTestId('compare-hours-button-rest_0002').click();
  await page.waitForTimeout(300);

  await page.getByTestId('compare-hours-button-rest_0003').click();
  await page.waitForTimeout(300);

  const stored = await page.evaluate(() => localStorage.getItem('hoursComparison'));
  expect(stored).toBeTruthy();
  const data = JSON.parse(stored!);
  expect(data.length).toBe(3);

  const sidebar = page.getByTestId('hours-comparison-sidebar');
  await expect(sidebar).toBeVisible();

  const items = page.getByTestId('comparison-restaurant-item');
  await expect(items).toHaveCount(3);

  await expect(items.first()).toContainText(/rest_0001|Restaurant/);
});
