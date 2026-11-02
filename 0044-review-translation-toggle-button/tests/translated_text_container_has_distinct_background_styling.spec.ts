import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '285e4e71-fe48-4e5e-bff1-ffa88a2de5a6';

test.describe('Review Translation Toggle - Distinct container styling', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('translated text container has distinct background styling', async ({ page }) => {
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
    
    const translateButton = page.locator('[data-testid="review-translate-button"]').first();
    await expect(translateButton).toBeVisible();
    
    await translateButton.click();
    await page.waitForTimeout(500);
    
    const translatedText = page.locator('[data-testid="review-translated-text"]').first();
    await expect(translatedText).toBeVisible();
    
    const backgroundColor = await translatedText.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(backgroundColor).not.toBe('transparent');
  });
});