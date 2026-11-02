import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '285e4e71-fe48-4e5e-bff1-ffa88a2de5a6';

test.describe('Review Translation Toggle - Translated prefix format', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('translated text contains Translated prefix', async ({ page }) => {
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
    
    const translateButton = page.locator('[data-testid="review-translate-button"]').first();
    await expect(translateButton).toBeVisible();
    
    await translateButton.click();
    await page.waitForTimeout(500);
    
    const translatedText = page.locator('[data-testid="review-translated-text"]').first();
    await expect(translatedText).toBeVisible();
    await expect(translatedText).toContainText('[Translated]');
  });
});