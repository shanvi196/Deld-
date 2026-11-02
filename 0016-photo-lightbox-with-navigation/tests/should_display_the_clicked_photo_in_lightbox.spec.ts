import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Photo Lightbox - Lightbox displays correct photo', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test('should display the clicked photo in lightbox', async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
    
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
    
    const reviewPhotos = page.locator('[data-testid="review-photo"]');
    const photoCount = await reviewPhotos.count();
    expect(photoCount).toBeGreaterThan(0);
    
    const clickedPhoto = reviewPhotos.first();
    const clickedPhotoSrc = await clickedPhoto.getAttribute('src');
    expect(clickedPhotoSrc).toBeTruthy();
    
    await clickedPhoto.click();
    await page.waitForTimeout(500);
    
    const lightboxModal = page.getByTestId('photo-lightbox-modal');
    await expect(lightboxModal).toBeVisible();
    
    const lightboxPhoto = page.getByTestId('lightbox-photo');
    await expect(lightboxPhoto).toBeVisible();
    
    const lightboxPhotoSrc = await lightboxPhoto.getAttribute('src');
    expect(lightboxPhotoSrc).toBeTruthy();
    expect(lightboxPhotoSrc).toContain(clickedPhotoSrc!.split('/').pop()!.split('?')[0]);
  });
});