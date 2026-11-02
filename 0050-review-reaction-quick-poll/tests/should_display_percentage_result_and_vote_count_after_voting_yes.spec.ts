import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Reaction Quick Poll - Results Display After Voting', () => {
  test('should display percentage result and vote count after voting Yes', async ({ page }) => {
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

    await firstYesButton.click();
    await page.waitForTimeout(500);

    const resultElement = page.locator(`[data-testid="poll-result-${reviewId}"]`);
    await expect(resultElement).toBeVisible();

    await expect(resultElement).toContainText(/\d+%.*found helpful/i);

    const countElement = page.locator(`[data-testid="poll-count-${reviewId}"]`);
    await expect(countElement).toBeVisible();

    const countText = await countElement.textContent();
    expect(countText).toMatch(/1|1 vote/i);
  });
});