import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Comparison Slider Feature', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('comparison toggle button does NOT appear for reviews with 1, 3, or 4 photos', async ({ page }) => {
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
    
    const reviewsList = page.locator('[data-testid="recommended-reviews-section"]');
    await expect(reviewsList).toBeVisible();
    
    const reviewCards = page.locator('[data-testid^="review-card-"]');
    const cardCount = await reviewCards.count();
    
    for (let i = 0; i < Math.min(cardCount, 10); i++) {
      const card = reviewCards.nth(i);
      const photoCount = await card.locator('[data-testid="review-photo"]').count();
      
      if (photoCount === 1 || photoCount === 3 || photoCount === 4) {
        const toggleButton = card.locator('[data-testid="comparison-toggle-button"]');
        await expect(toggleButton).not.toBeVisible();
      }
    }
  });
});
