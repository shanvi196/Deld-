import { test, expect } from '@playwright/test';

test('Remove restaurant from comparison sidebar', async ({ page }) => {
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

  await expect(page.getByTestId('comparison-restaurant-item')).toHaveCount(3);

  const removeButton = page.getByTestId('remove-comparison-rest_0002');
  await removeButton.click();
  await page.waitForTimeout(300);

  const stored = await page.evaluate(() => localStorage.getItem('hoursComparison'));
  const data = JSON.parse(stored!);
  expect(data.length).toBe(2);
  expect(data).not.toContain('rest_0002');

  await expect(page.getByTestId('comparison-restaurant-item')).toHaveCount(2);
});
