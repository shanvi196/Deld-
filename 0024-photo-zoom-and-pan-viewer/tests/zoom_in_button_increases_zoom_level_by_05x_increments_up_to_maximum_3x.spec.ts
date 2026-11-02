import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Photo Zoom Controls - Zoom In', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('zoom in button increases zoom level by 0.5x increments up to maximum 3x', async ({ page }) => {
    const menuSlide = page.locator('[data-testid="menu-carousel-slide"]').first();
    await menuSlide.waitFor({ state: 'visible' });
    await menuSlide.click();

    await page.waitForSelector('[data-testid="menu-photo-dialog"]', { state: 'visible' });

    const zoomInButton = page.getByTestId('zoom-in-button');
    const zoomLevelIndicator = page.getByTestId('zoom-level-indicator');

    await expect(zoomLevelIndicator).toHaveText('1.0x');

    await zoomInButton.click();
    await expect(zoomLevelIndicator).toHaveText('1.5x');

    await zoomInButton.click();
    await zoomInButton.click();
    await zoomInButton.click();
    await expect(zoomLevelIndicator).toHaveText('3.0x');

    // Max zoom reached
    await expect(zoomInButton).toBeDisabled();

    // Clicking again should not exceed 3x
    await zoomInButton.click({ force: true });
    await expect(zoomLevelIndicator).toHaveText('3.0x');
  });
});
