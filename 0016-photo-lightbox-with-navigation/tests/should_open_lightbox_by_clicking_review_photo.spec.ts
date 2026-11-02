import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Photo Lightbox - Open lightbox by clicking review photo', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test('should open lightbox by clicking review photo', async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
    
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
    
    const reviewPhotos = page.locator('[data-testid="review-photo"]');
    const reviewPhotoCount = await reviewPhotos.count();
    
    expect(reviewPhotoCount).toBeGreaterThan(0);
    
    await reviewPhotos.first().click();
    await page.waitForTimeout(500);
    
    const lightboxModal = page.getByTestId('photo-lightbox-modal');
    await expect(lightboxModal).toBeVisible();
    
    const lightboxPhoto = page.getByTestId('lightbox-photo');
    await expect(lightboxPhoto).toBeVisible();
    
    const closeButton = page.getByTestId('lightbox-close-button');
    await expect(closeButton).toBeVisible();
  });
});