import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Photo Zoom Controls - Disabled State', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('zoom out and reset buttons are disabled at minimum zoom 1x', async ({ page }) => {
    const menuSlide = page.locator('[data-testid="menu-carousel-slide"]').first();
    await menuSlide.waitFor({ state: 'visible' });
    await menuSlide.click();

    await page.waitForSelector('[data-testid="menu-photo-dialog"]', { state: 'visible' });

    const zoomOutButton = page.getByTestId('zoom-out-button');
    const zoomResetButton = page.getByTestId('zoom-reset-button');
    const zoomInButton = page.getByTestId('zoom-in-button');

    // At 1x zoom
    await expect(zoomOutButton).toBeDisabled();
    await expect(zoomResetButton).toBeDisabled();

    // Zoom in
    await zoomInButton.click();

    // Buttons enabled above 1x
    await expect(zoomOutButton).toBeEnabled();
    await expect(zoomResetButton).toBeEnabled();
  });
});
