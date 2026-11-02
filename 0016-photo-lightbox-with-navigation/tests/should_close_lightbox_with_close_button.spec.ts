import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Photo Lightbox - Close lightbox with close button', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test('should close lightbox with close button', async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
    
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
    
    const reviewPhotos = page.locator('[data-testid="review-photo"]');
    expect(await reviewPhotos.count()).toBeGreaterThan(0);
    
    await reviewPhotos.first().click();
    await page.waitForTimeout(500);
    
    const lightboxModal = page.getByTestId('photo-lightbox-modal');
    await expect(lightboxModal).toBeVisible();
    
    const closeButton = page.getByTestId('lightbox-close-button');
    await closeButton.click();
    await page.waitForTimeout(500);
    
    await expect(lightboxModal).not.toBeVisible();
    
    const restaurantLeftPanel = page.getByTestId('restaurant-left-panel');
    await expect(restaurantLeftPanel).toBeVisible();
  });
});