import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Voted reviews show disabled helpful button state', async ({ page }) => {
  await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  
  await page.getByTestId('recommended-reviews-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  
  const firstReviewCard = page.locator('[data-testid="review-card"]').first();
  const reviewId = await firstReviewCard.getAttribute('data-review-id');
  expect(reviewId).toBeTruthy();
  
  await page.evaluate((rid) => {
    localStorage.setItem('deld-helpful-votes', JSON.stringify([rid]));
  }, reviewId);
  
  await page.reload();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.getByTestId('recommended-reviews-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  
  const votedButton = firstReviewCard.getByTestId('review-helpful-voted');

await expect(votedButton).toBeVisible();
await expect(votedButton).toHaveText('You found this helpful');

// Optional UI check
await expect(votedButton).toHaveClass(/text-gray-500/);

// Ensure original button is not clickable anymore
await expect(
  firstReviewCard.getByTestId('review-helpful-button')
).toHaveCount(0);
});