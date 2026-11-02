import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Multiple votes across different reviews accumulate in localStorage', async ({ page }) => {
  await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  
  await page.evaluate(() => localStorage.removeItem('deld-helpful-votes'));
  
  await page.getByTestId('recommended-reviews-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  
  const reviewCards = page.locator('[data-testid="review-card"]');
  const count = await reviewCards.count();
  expect(count).toBeGreaterThanOrEqual(3);
  
  const firstReviewId = await reviewCards.first().getAttribute('data-review-id');
  const secondReviewId = await reviewCards.nth(1).getAttribute('data-review-id');
  const thirdReviewId = await reviewCards.nth(2).getAttribute('data-review-id');
  expect(firstReviewId).toBeTruthy();
  expect(secondReviewId).toBeTruthy();
  expect(thirdReviewId).toBeTruthy();
  
  const firstHelpfulButton = reviewCards.first().getByTestId('review-helpful-button');
  await firstHelpfulButton.click();
  await page.waitForTimeout(300);
  
  const secondHelpfulButton = reviewCards.nth(1).getByTestId('review-helpful-button');
  await secondHelpfulButton.click();
  await page.waitForTimeout(300);
  
  const thirdHelpfulButton = reviewCards.nth(2).getByTestId('review-helpful-button');
  await thirdHelpfulButton.click();
  await page.waitForTimeout(300);
  
  const storedVotes = await page.evaluate(() => {
    const votes = localStorage.getItem('deld-helpful-votes');
    return votes ? JSON.parse(votes) : [];
  });
  
  expect(storedVotes).toHaveLength(3);
  expect(storedVotes).toContain(firstReviewId);
  expect(storedVotes).toContain(secondReviewId);
  expect(storedVotes).toContain(thirdReviewId);
});