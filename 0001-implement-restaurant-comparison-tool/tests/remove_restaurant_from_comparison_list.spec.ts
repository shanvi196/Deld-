import { test, expect } from '@playwright/test';

test('Remove restaurant from comparison list', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.evaluate(() => localStorage.removeItem('comparisonList'));
  await page.reload();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  const compareButton = page.getByTestId('restaurant-card-compare-button-25047088-5a40-4fab-be5c-3ee9a54fb980');
  await compareButton.click();
  await page.waitForTimeout(300);

  const comparisonBar = page.getByTestId('comparison-bar');
  await expect(comparisonBar).toContainText('1 restaurant selected');

  await compareButton.click();
  await page.waitForTimeout(300);

  await expect(comparisonBar).not.toBeVisible();

  const storageData = await page.evaluate(() => {
    const data = localStorage.getItem('comparisonList');
    return data ? JSON.parse(data) : [];
  });
  expect(storageData).toEqual([]);
});
