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

  test('comparison slider handle is draggable and changes image reveal', async ({ page }) => {
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
        
        const handle = card.locator('[data-testid="comparison-slider-handle"]');
        await expect(handle).toBeVisible();
        
        const container = card.locator('[data-testid="comparison-slider-container"]');
        const containerBox = await container.boundingBox();
        expect(containerBox).not.toBeNull();
        
        const handleBox = await handle.boundingBox();
        expect(handleBox).not.toBeNull();
        
        const initialX = handleBox!.x + handleBox!.width / 2;
        const targetX = containerBox!.x + containerBox!.width * 0.25;
        
        await page.mouse.move(initialX, handleBox!.y + handleBox!.height / 2);
        await page.mouse.down();
        await page.mouse.move(targetX, handleBox!.y + handleBox!.height / 2);
        await page.mouse.up();
        
        await page.waitForTimeout(300);
        
        const newHandleBox = await handle.boundingBox();
        expect(newHandleBox).not.toBeNull();
        expect(newHandleBox!.x).toBeLessThan(initialX);
        
        break;
      }
    }
  });
});
