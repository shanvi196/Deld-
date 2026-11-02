import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Click helpful button shows toast notification', async ({ page }) => {
  await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  
  await page.getByTestId('recommended-reviews-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  
  const helpfulButton = page.getByTestId('review-helpful-button').first();
  await expect(helpfulButton).toBeVisible();
  
  await helpfulButton.click();
  
  const toast = page.getByTestId('helpful-toast');
  await expect(toast).toBeVisible({ timeout: 3000 });
  await expect(toast).toHaveText('Thanks for the feedback!');
});