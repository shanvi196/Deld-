import { test, expect } from '@playwright/test';

test('Maximum comparison limit of three restaurants', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.evaluate(() => localStorage.setItem('comparisonList', JSON.stringify(['25047088-5a40-4fab-be5c-3ee9a54fb980', '4f3833e0-ef7d-44fe-ba19-a31447f4d493', '64741b05-ad80-43c5-b282-a7da4b9dbb4b'])));
  await page.reload();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  const comparisonBar = page.getByTestId('comparison-bar');
  await expect(comparisonBar).toContainText('3 restaurants selected');

  const fourthButton = page.getByTestId('restaurant-card-compare-button-a78fc202-0cf3-4e61-8138-25c8cbad84a4');
  await fourthButton.click();
  await page.waitForTimeout(500);

  await expect(comparisonBar).toContainText('3 restaurants selected');

  const toastMessage = page.getByText('Maximum 3 restaurants can be compared');
  await expect(toastMessage).toBeVisible({ timeout: 5000 });
});
