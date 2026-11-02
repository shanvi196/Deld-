import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Rating Filter Chips - Deselect chip', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
  });

  test('should show all reviews again when deselecting active 5-star chip', async ({ page }) => {
    const ratingChip5 = page.getByTestId('rating-chip-5');
    await expect(ratingChip5).toBeVisible();

    const chipClassBefore = await ratingChip5.getAttribute('class');

    await ratingChip5.click();
    await page.waitForTimeout(500);

    const filteredReviewCards = page.locator('[data-testid="review-card"]');
    const filteredCount = await filteredReviewCards.count();

    await ratingChip5.click();
    await page.waitForTimeout(500);

    const chipClassAfterDeselect = await ratingChip5.getAttribute('class');
    expect(chipClassAfterDeselect).toEqual(chipClassBefore);

    const allReviewCards = page.locator('[data-testid="review-card"]');
    const allCount = await allReviewCards.count();
    expect(allCount).toBeGreaterThanOrEqual(filteredCount);
  });
});