import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Photo Lightbox - Photo counter displays correctly', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test('should display photo counter in X of Y format', async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
    
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
    
    const reviewPhotos = page.locator('[data-testid="review-photo"]');
    const photoCount = await reviewPhotos.count();
    expect(photoCount).toBeGreaterThan(2);
    
    await reviewPhotos.nth(1).click();
    await page.waitForTimeout(500);
    
    const lightboxModal = page.getByTestId('photo-lightbox-modal');
    await expect(lightboxModal).toBeVisible();
    
    const photoCounter = page.getByTestId('lightbox-photo-counter');
    await expect(photoCounter).toBeVisible();
    
    const counterText = await photoCounter.textContent();
    expect(counterText).toMatch(/\d+\s+of\s+\d+/);
    expect(counterText).toContain('1 of');
  });
});