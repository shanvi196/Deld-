import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Reaction Quick Poll - Poll Buttons Display', () => {
  test('should display poll buttons below each review', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(10000);

    const reviewsSection = page.getByTestId('recommended-reviews-section');
    await expect(reviewsSection).toBeVisible();

    const reviewCards = page.locator('[data-testid="review-card"]');
    const reviewCount = await reviewCards.count();
    expect(reviewCount).toBeGreaterThan(0);

    const firstReviewCard = reviewCards.first();
    await expect(firstReviewCard).toBeVisible();

    const pollContainers = page.locator('[data-testid^="review-poll-"]');
    const pollCount = await pollContainers.count();
    expect(pollCount).toBeGreaterThan(0);

    const firstPollContainer = pollContainers.first();
    await expect(firstPollContainer).toContainText('Did this review help you decide?');

    const yesButtons = page.locator('[data-testid^="poll-yes-btn-"]');
    const noButtons = page.locator('[data-testid^="poll-no-btn-"]');
    expect(await yesButtons.count()).toBeGreaterThan(0);
    expect(await noButtons.count()).toBeGreaterThan(0);
  });
});