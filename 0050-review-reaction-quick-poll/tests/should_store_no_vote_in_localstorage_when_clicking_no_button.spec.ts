import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Reaction Quick Poll - No Vote localStorage', () => {
  test('should store no vote in localStorage when clicking No button', async ({ page }) => {
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

    const noButtons = page.locator('[data-testid^="poll-no-btn-"]');
    await expect(noButtons.first()).toBeVisible();

    const firstNoButton = noButtons.first();
    const testId = await firstNoButton.getAttribute('data-testid');
    const reviewId = testId?.replace('poll-no-btn-', '');
    expect(reviewId).toBeTruthy();

    await firstNoButton.click();
    await page.waitForTimeout(500);

    const storedPolls = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('review-polls') || '{}');
    });

    expect(storedPolls[reviewId!]).toBe('no');

    await expect(page.locator(`[data-testid="poll-result-${reviewId}"]`)).toBeVisible();
  });
});