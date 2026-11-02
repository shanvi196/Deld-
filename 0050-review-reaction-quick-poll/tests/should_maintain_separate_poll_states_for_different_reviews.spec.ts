import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Reaction Quick Poll - Multi-Review State Sync', () => {
  test('should maintain separate poll states for different reviews', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(10000);

    await page.evaluate(() => {
      localStorage.removeItem('review-polls');
    });

    const reviewsSection = page.getByTestId('recommended-reviews-section');
    await expect(reviewsSection).toBeVisible();

    const yesButtons = page.locator('[data-testid^="poll-yes-btn-"]');
    const buttonCount = await yesButtons.count();

    if (buttonCount < 2) {
      test.skip();
      return;
    }

    const firstTestId = await yesButtons.nth(0).getAttribute('data-testid');
    const secondTestId = await yesButtons.nth(1).getAttribute('data-testid');
    const firstReviewId = firstTestId?.replace('poll-yes-btn-', '');
    const secondReviewId = secondTestId?.replace('poll-yes-btn-', '');

    await yesButtons.nth(0).click();
    await page.waitForTimeout(500);

    await expect(page.locator(`[data-testid="poll-result-${firstReviewId}"]`)).toBeVisible();

    await expect(page.locator(`[data-testid="poll-yes-btn-${secondReviewId}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="poll-no-btn-${secondReviewId}"]`)).toBeVisible();

    const storedPolls = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('review-polls') || '{}');
    });

    expect(Object.keys(storedPolls).length).toBe(1);
    expect(storedPolls[firstReviewId!]).toBe('yes');
    expect(storedPolls[secondReviewId!]).toBeUndefined();
  });
});