import { test, expect } from '@playwright/test';

test('Add multiple restaurants to comparison', async ({ page }) => {
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

  await page.getByTestId('restaurant-card-compare-button-64741b05-ad80-43c5-b282-a7da4b9dbb4b').click();
  await page.waitForTimeout(300);

  const comparisonBar = page.getByTestId('comparison-bar');
  await expect(comparisonBar).toContainText('3 restaurants selected');

  await expect(page.getByTestId('restaurant-card-compare-button-25047088-5a40-4fab-be5c-3ee9a54fb980')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('restaurant-card-compare-button-4f3833e0-ef7d-44fe-ba19-a31447f4d493')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('restaurant-card-compare-button-64741b05-ad80-43c5-b282-a7da4b9dbb4b')).toHaveAttribute('aria-pressed', 'true');
});
