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

  test('comparison slider starts with handle at 50% position', async ({ page }) => {
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
    
    const reviewCards = page.locator('[data-testid^="review-card-"]');
    const cardCount = await reviewCards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = reviewCards.nth(i);
      const photoCount = await card.locator('[data-testid="review-photo"]').count();
      
      if (photoCount === 2) {
        const toggleButton = card.locator('[data-testid="comparison-toggle-button"]');
        await toggleButton.click();
        await page.waitForTimeout(500);
        
        const container = card.locator('[data-testid="comparison-slider-container"]');
        const handle = card.locator('[data-testid="comparison-slider-handle"]');
        
        const containerBox = await container.boundingBox();
        const handleBox = await handle.boundingBox();
        
        expect(containerBox).not.toBeNull();
        expect(handleBox).not.toBeNull();
        
        const containerCenter = containerBox!.x + containerBox!.width / 2;
        const handleCenter = handleBox!.x + handleBox!.width / 2;
        
        const tolerance = containerBox!.width * 0.1;
        expect(Math.abs(handleCenter - containerCenter)).toBeLessThan(tolerance);
        
        break;
      }
    }
  });
});
