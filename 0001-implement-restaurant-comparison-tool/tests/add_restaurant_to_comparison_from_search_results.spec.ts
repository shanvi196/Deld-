import { test, expect } from '@playwright/test';

test('Add restaurant to comparison from search results', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.evaluate(() => localStorage.removeItem('comparisonList'));
  await page.reload();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  const firstRestaurantButton = page.getByTestId('restaurant-card-compare-button-25047088-5a40-4fab-be5c-3ee9a54fb980');
  await firstRestaurantButton.click();

  const comparisonBar = page.getByTestId('comparison-bar');
  await expect(comparisonBar).toBeVisible();

  await expect(comparisonBar).toContainText('1 restaurant selected');

  const compareNowButton = page.getByTestId('comparison-bar-compare-button');
  await expect(compareNowButton).toBeVisible();
});
