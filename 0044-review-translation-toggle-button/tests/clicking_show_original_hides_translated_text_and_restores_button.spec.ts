import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '285e4e71-fe48-4e5e-bff1-ffa88a2de5a6';

test.describe('Review Translation Toggle - Toggle back to original', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('clicking Show Original hides translated text and restores button', async ({ page }) => {
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
    
    const translateButton = page.locator('[data-testid="review-translate-button"]').first();
    await expect(translateButton).toBeVisible();
    
    await translateButton.click();
    await page.waitForTimeout(500);
    
    await expect(translateButton).toContainText('Show Original');
    const translatedText = page.locator('[data-testid="review-translated-text"]').first();
    await expect(translatedText).toBeVisible();
    
    await translateButton.click();
    await page.waitForTimeout(500);
    
    await expect(translatedText).not.toBeVisible();
    await expect(translateButton).toContainText('Translate');
  });
});