import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Photo Zoom Controls - Visibility', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('zoom controls are visible when photo dialog opens', async ({ page }) => {
    const menuSlide = page.locator('[data-testid="menu-carousel-slide"]').first();
    await menuSlide.waitFor({ state: 'visible' });
    await menuSlide.click();

    await page.waitForSelector('[data-testid="menu-photo-dialog"]', { state: 'visible' });

    await expect(page.getByTestId('zoom-in-button')).toBeVisible();
    await expect(page.getByTestId('zoom-out-button')).toBeVisible();
    await expect(page.getByTestId('zoom-reset-button')).toBeVisible();
    await expect(page.getByTestId('zoom-level-indicator')).toHaveText('1.0x');
  });
});
