import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Photo Lightbox - Navigate with arrow keys', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test('should navigate photos with arrow keys when multiple photos exist', async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
    
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);

    const photos = page.locator('[data-testid="review-photo"]');
    const totalPhotos = await photos.count();

    expect(totalPhotos).toBeGreaterThanOrEqual(2);

    await photos.nth(1).click();
    await page.waitForTimeout(500);
    
    const lightboxModal = page.getByTestId('photo-lightbox-modal');
    await expect(lightboxModal).toBeVisible();
    
    const photoCounter = page.getByTestId('lightbox-photo-counter');
    await expect(photoCounter).toBeVisible();
    
    const lightboxPhoto = page.getByTestId('lightbox-photo');
    const initialPhotoSrc = await lightboxPhoto.getAttribute('src');
    expect(initialPhotoSrc).toBeTruthy();
    
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    
    if (totalPhotos >= 2) {
      const updatedPhotoSrc = await lightboxPhoto.getAttribute('src');
      const updatedCounterText = await photoCounter.textContent();
      expect(updatedCounterText).toContain('2 of');
      expect(updatedPhotoSrc).not.toBe(initialPhotoSrc);
      
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(300);
      
      const revertedPhotoSrc = await lightboxPhoto.getAttribute('src');
      const revertedCounterText = await photoCounter.textContent();
      expect(revertedCounterText).toContain('1 of');
      expect(revertedPhotoSrc).toBe(initialPhotoSrc);
    }
  });
});