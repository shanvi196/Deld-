import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Helpful vote persists in localStorage', async ({ page }) => {
  await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  
  await page.evaluate(() => localStorage.removeItem('deld-helpful-votes'));
  
  await page.getByTestId('recommended-reviews-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  
  const firstReviewCard = page.locator('[data-testid="review-card"]').first();
  const reviewId = await firstReviewCard.getAttribute('data-review-id');
  expect(reviewId).toBeTruthy();
  
  const helpfulButton = page.getByTestId('review-helpful-button').first();
  await helpfulButton.click();
  await page.waitForTimeout(500);
  
  const storedVotes = await page.evaluate(() => {
    const votes = localStorage.getItem('deld-helpful-votes');
    return votes ? JSON.parse(votes) : [];
  });
  
  expect(storedVotes).toHaveLength(1);
  expect(storedVotes).toContain(reviewId);
});