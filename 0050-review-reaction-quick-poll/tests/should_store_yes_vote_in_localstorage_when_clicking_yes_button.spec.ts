import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Reaction Quick Poll - Yes Vote localStorage', () => {
  test('should store yes vote in localStorage when clicking Yes button', async ({ page }) => {
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
    await expect(yesButtons.first()).toBeVisible();

    const firstYesButton = yesButtons.first();
    const testId = await firstYesButton.getAttribute('data-testid');
    const reviewId = testId?.replace('poll-yes-btn-', '');
    expect(reviewId).toBeTruthy();

    await firstYesButton.click();
    await page.waitForTimeout(500);

    const storedPolls = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('review-polls') || '{}');
    });

    expect(storedPolls[reviewId!]).toBe('yes');

    await expect(page.locator(`[data-testid="poll-yes-btn-${reviewId}"]`)).not.toBeVisible();
    await expect(page.locator(`[data-testid="poll-no-btn-${reviewId}"]`)).not.toBeVisible();
  });
});