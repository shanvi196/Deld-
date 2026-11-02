import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Hide helpful filter removes voted reviews from display', async ({ page }) => {
  await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  
  await page.getByTestId('recommended-reviews-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  
  const reviewCards = page.locator('[data-testid="review-card"]');
  const initialCount = await reviewCards.count();
  expect(initialCount).toBeGreaterThanOrEqual(2);
  
  const firstReviewId = await reviewCards.first().getAttribute('data-review-id');
  const secondReviewId = await reviewCards.nth(1).getAttribute('data-review-id');
  expect(firstReviewId).toBeTruthy();
  expect(secondReviewId).toBeTruthy();
  
  await page.evaluate((ids) => {
    localStorage.setItem('deld-helpful-votes', JSON.stringify(ids));
  }, [firstReviewId, secondReviewId]);
  
  await page.reload();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.getByTestId('recommended-reviews-section').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  
  const hideFilter = page.getByTestId('hide-helpful-filter');
  await expect(hideFilter).toBeVisible();
  await expect(hideFilter).not.toBeChecked();
  
  await hideFilter.check();
  await page.waitForTimeout(500);
  
  const filteredCount = await reviewCards.count();
  expect(filteredCount).toBe(initialCount - 2);
  
  const visibleReviewIds = await reviewCards.evaluateAll(cards => 
    cards.map(card => card.getAttribute('data-review-id'))
  );
  expect(visibleReviewIds).not.toContain(firstReviewId);
  expect(visibleReviewIds).not.toContain(secondReviewId);
});