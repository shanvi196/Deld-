import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Rating Filter Chips - Pagination persistence', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
  });

  test('should maintain filter state when navigating between review pages', async ({ page }) => {
    const ratingChip5 = page.getByTestId('rating-chip-5');
    await expect(ratingChip5).toBeVisible();

    let chipClassBefore = await ratingChip5.getAttribute('class');

    await ratingChip5.click();
    await page.waitForTimeout(500);

    let chipClassAfter = await ratingChip5.getAttribute('class');
    expect(chipClassAfter).not.toEqual(chipClassBefore)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const nextButton = restaurantDetailsPage.reviewsPaginationNext;
    const isNextEnabled = await nextButton.isEnabled();

    if (isNextEnabled) {
      await restaurantDetailsPage.clickReviewsNextPage();
      await page.waitForTimeout(1000);

      let chipClassNextPage = await ratingChip5.getAttribute('class');
      expect(chipClassNextPage).toEqual(chipClassAfter);
      const filteredReviewCards = page.locator('[data-testid="review-card"]');
      const filteredCount = await filteredReviewCards.count();

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
    }
  });
});