import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Rating Filter Chips - 4-star-plus filter', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
  });

  test('should filter reviews to show 4+ star reviews when clicking 4-star chip', async ({ page }) => {
    const ratingChip4 = page.getByTestId('rating-chip-4');
    const ratingChip5 = page.getByTestId('rating-chip-5');
    const ratingChip3 = page.getByTestId('rating-chip-3');

    await expect(ratingChip4).toBeVisible();

    const chip4ClassBefore = await ratingChip4.getAttribute('class');
    const chip5ClassBefore = await ratingChip5.getAttribute('class');
    const chip3ClassBefore = await ratingChip3.getAttribute('class');

    await ratingChip4.click();
    await page.waitForTimeout(500);

    const chip4ClassAfter = await ratingChip4.getAttribute('class');
    expect(chip4ClassAfter).not.toEqual(chip4ClassBefore);

    const chip5ClassAfter = await ratingChip5.getAttribute('class');
    expect(chip5ClassAfter).toEqual(chip5ClassBefore);

    const chip3ClassAfter = await ratingChip3.getAttribute('class');
    expect(chip3ClassAfter).toEqual(chip3ClassBefore);

    const filteredReviewCards = page.locator('[data-testid="review-card"]');
    const filteredCount = await filteredReviewCards.count();

    if (filteredCount > 0) {
      const reviewCards = await filteredReviewCards.all();
      for (const card of reviewCards) {
        const cardWrapper = card.locator('..');
        const filledPaths = cardWrapper.locator('svg path[fill="currentColor"]');
        const filledCount = await filledPaths.count();
        const starCount = Math.floor(filledCount / 2);
        expect(starCount).toBeGreaterThanOrEqual(4);
      }
    }
  });
});