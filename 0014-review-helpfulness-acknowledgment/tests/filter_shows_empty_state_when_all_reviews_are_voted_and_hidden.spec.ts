import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Filter shows empty state when all reviews are voted and hidden', async ({ page }) => {
  await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  
  await page.getByTestId('recommended-reviews-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  
  const reviewCards = page.locator('[data-testid="review-card"]');
  const allReviewIds = await reviewCards.evaluateAll(cards => 
    cards.map(card => card.getAttribute('data-review-id')).filter(id => id !== null)
  );
  expect(allReviewIds.length).toBeGreaterThan(0);
  
  await page.evaluate((ids) => {
    localStorage.setItem('deld-helpful-votes', JSON.stringify(ids));
  }, allReviewIds);
  
  await page.reload();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.getByTestId('recommended-reviews-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  
  const hideFilter = page.getByTestId('hide-helpful-filter');
  await hideFilter.check();
  await page.waitForTimeout(500);
  
  const visibleReviewCards = await reviewCards.count();
  expect(visibleReviewCards).toBe(0);
  
  const noReviewsMessage = page.getByTestId('no-reviews-message');
  await expect(noReviewsMessage).toBeVisible();
  await expect(noReviewsMessage).toHaveText('No reviews to display');
  
  await expect(hideFilter).toBeChecked();
  await expect(hideFilter).toBeEnabled();
});