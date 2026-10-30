import { test, expect } from '@playwright/test';

test('Persist comparison state across page navigation', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.evaluate(() => localStorage.removeItem('comparisonList'));
  await page.reload();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.getByTestId('restaurant-card-compare-button-25047088-5a40-4fab-be5c-3ee9a54fb980').click();
  await page.waitForTimeout(300);

  const comparisonBar = page.getByTestId('comparison-bar');
  await expect(comparisonBar).toContainText('1 restaurant selected');

  await page.goto('http://localhost:3000/restaurants/4f3833e0-ef7d-44fe-ba19-a31447f4d493');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('comparison-bar')).toBeVisible();
  await expect(page.getByTestId('comparison-bar')).toContainText('1 restaurant selected');

  const storageData = await page.evaluate(() => {
    const data = localStorage.getItem('comparisonList');
    return data ? JSON.parse(data) : [];
  });
  expect(storageData).toEqual(['25047088-5a40-4fab-be5c-3ee9a54fb980']);
});
