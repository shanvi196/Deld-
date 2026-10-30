import { test, expect } from '@playwright/test';

test('Navigate to comparison view with selected restaurants', async ({ page }) => {
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
  await page.getByTestId('restaurant-card-compare-button-4f3833e0-ef7d-44fe-ba19-a31447f4d493').click();
  await page.waitForTimeout(300);

  const compareNowButton = page.getByTestId('comparison-bar-compare-button');
  await compareNowButton.click();

  await page.waitForURL('http://localhost:3000/compare');
  expect(page.url()).toBe('http://localhost:3000/compare');

  const comparisonTable = page.getByTestId('comparison-table');
  await expect(comparisonTable).toBeVisible();

  const restaurantColumns = page.locator('[data-testid^="comparison-column-"]');
  await expect(restaurantColumns).toHaveCount(2);
});
