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

  test('clicking toggle button shows ComparisonSlider and hides photo grid', async ({ page }) => {
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
    
    const reviewCards = page.locator('[data-testid^="review-card-"]');
    const cardCount = await reviewCards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = reviewCards.nth(i);
      const photoCount = await card.locator('[data-testid="review-photo"]').count();
      
      if (photoCount === 2) {
        const toggleButton = card.locator('[data-testid="comparison-toggle-button"]');
        await expect(toggleButton).toBeVisible();
        await expect(toggleButton).toHaveText('View as Comparison');
        
        await toggleButton.click();
        await page.waitForTimeout(500);
        
        await expect(toggleButton).toHaveText('View as Grid');
        
        const sliderContainer = card.locator('[data-testid="comparison-slider-container"]');
        await expect(sliderContainer).toBeVisible();
        
        const beforeImage = card.locator('[data-testid="comparison-before-image"]');
        const afterImage = card.locator('[data-testid="comparison-after-image"]');
        await expect(beforeImage).toBeVisible();
        await expect(afterImage).toBeVisible();
        
        break;
      }
    }
  });
});
