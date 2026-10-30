import { test, expect } from '@playwright/test';

test('Prevent adding more than 4 restaurants', async ({ page }) => {
  await page.goto('http://localhost:3000?query=&location=&page=1');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    localStorage.setItem('hoursComparison', JSON.stringify(['rest_0001', 'rest_0002', 'rest_0003', 'rest_0004']));
  });

  await page.reload();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  const fifthButton = page.getByTestId('compare-hours-button-rest_0005');
  await expect(fifthButton).toBeDisabled();

  const stored = await page.evaluate(() => localStorage.getItem('hoursComparison'));
  const data = JSON.parse(stored!);
  expect(data.length).toBe(4);

  const items = page.getByTestId('comparison-restaurant-item');
  await expect(items).toHaveCount(4);
});
