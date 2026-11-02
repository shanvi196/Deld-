import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Sorting Dropdown', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
  });

  test('should persist sort selection on page refresh', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}?reviewSort=oldest`);
    await restaurantDetailsPage.waitForPageLoad();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    const trigger = page.getByTestId('review-sort-dropdown-trigger');
    await expect(trigger).toContainText('Oldest First');
    
    await page.reload();
    await restaurantDetailsPage.waitForPageLoad();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    await expect(trigger).toContainText('Oldest First');
    expect(page.url()).toContain('reviewSort=oldest');
  });
});