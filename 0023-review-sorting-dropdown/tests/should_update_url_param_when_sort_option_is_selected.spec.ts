import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Sorting Dropdown', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
  });

  test('should update URL param when sort option is selected', async ({ page }) => {
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    await page.getByTestId('review-sort-dropdown-trigger').click();
    await page.waitForSelector('[data-testid="review-sort-dropdown-content"]');
    await page.getByTestId('review-sort-option-highest').click();
    
    await page.waitForTimeout(1000);
    await page.waitForURL(/reviewSort=highest/);
    expect(page.url()).toContain('reviewSort=highest');
    
    const trigger = page.getByTestId('review-sort-dropdown-trigger');
    await expect(trigger).toContainText('Highest Rated');
  });
});