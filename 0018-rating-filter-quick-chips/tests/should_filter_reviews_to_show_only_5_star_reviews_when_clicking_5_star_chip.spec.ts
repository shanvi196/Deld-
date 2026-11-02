import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Rating Filter Chips - 5-star filter', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
  });

  test('should filter reviews to show only 5-star reviews when clicking 5-star chip', async ({ page }) => {
    const ratingChip5 = page.getByTestId('rating-chip-5');
    await expect(ratingChip5).toBeVisible();

    const initialReviewCards = page.locator('[data-testid="review-card"]');
    const initialCount = await initialReviewCards.count();

    const chipClassBefore = await ratingChip5.getAttribute('class');

    await ratingChip5.click();
    await page.waitForTimeout(500);

    const chipClassAfter = await ratingChip5.getAttribute('class');
    expect(chipClassAfter).not.toEqual(chipClassBefore);

    const filteredReviewCards = page.locator('[data-testid="review-card"]');
    const filteredCount = await filteredReviewCards.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    if (filteredCount > 0) {
      const reviewCards = await filteredReviewCards.all();
      for (const card of reviewCards) {
        const cardWrapper = card.locator('..');
        const filledPaths = cardWrapper.locator('svg path[fill="currentColor"]');
        const filledCount = await filledPaths.count();
        const starCount = Math.floor(filledCount / 2);
        expect(starCount).toBeGreaterThanOrEqual(5);
      }
    }
  });
});