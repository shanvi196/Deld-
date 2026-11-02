import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const EMPTY_MENU_RESTAURANT_ID = 'aa3f1f01-3a8e-4861-8275-2f937b4ee74b';

test('should display empty state message when restaurant has no menu items', async ({ page }) => {
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await restaurantDetailsPage.goto(EMPTY_MENU_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('menu-items-section')).toBeVisible();
  await expect(page.getByTestId('menu-items-empty')).toBeVisible();
  await expect(page.getByTestId('menu-items-empty')).toHaveText('No menu items available');
  await expect(page.getByTestId('status-filter-bar')).toHaveCount(0);
  await expect(page.getByTestId('sold-out-count-badge')).toHaveCount(0);
});