import { test, expect } from '@playwright/test';

test('Persist comparison state after page reload', async ({ page }) => {
  await page.goto('http://localhost:3000?query=&location=&page=1');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    localStorage.setItem('hoursComparison', JSON.stringify(['rest_0001', 'rest_0003']));
  });

  await page.reload();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  const sidebar = page.getByTestId('hours-comparison-sidebar');
  await expect(sidebar).toBeVisible();

  const items = page.getByTestId('comparison-restaurant-item');
  await expect(items).toHaveCount(2);

  const button1 = page.getByTestId('compare-hours-button-rest_0001');
  await expect(button1).toBeDisabled();

  const button3 = page.getByTestId('compare-hours-button-rest_0003');
  await expect(button3).toBeDisabled();
});
