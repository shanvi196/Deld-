import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Sorting Dropdown', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
  });

  test('should reorder reviews when sorting by highest rated', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}?reviewSort=oldest`);
    await restaurantDetailsPage.waitForPageLoad();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(500);
    
    const reviewCards = page.locator('[data-testid="review-card"]');
    const reviewCount = await reviewCards.count();
    expect(reviewCount).toBeGreaterThan(1);
    
    await page.getByTestId('review-sort-dropdown-trigger').click();
    await page.getByTestId('review-sort-option-highest').click();
    
    await page.waitForURL(/reviewSort=highest/);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    await page.locator('[data-rating]').first().waitFor();

    const sortedReviews = page.locator('[data-rating]');
    const firstReviewRating = await sortedReviews.first().getAttribute('data-rating');
    const secondReviewRating = await sortedReviews.nth(1).getAttribute('data-rating');
    
    expect(firstReviewRating).not.toBeNull();
    expect(secondReviewRating).not.toBeNull();
    expect(Number(firstReviewRating)).toBeGreaterThanOrEqual(Number(secondReviewRating));
  });
});