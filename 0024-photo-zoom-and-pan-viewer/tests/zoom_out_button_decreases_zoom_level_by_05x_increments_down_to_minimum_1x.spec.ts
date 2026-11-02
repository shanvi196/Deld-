import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Photo Zoom Controls - Zoom Out', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('zoom out button decreases zoom level by 0.5x increments down to minimum 1x', async ({ page }) => {
    const menuSlide = page.locator('[data-testid="menu-carousel-slide"]').first();
    await menuSlide.waitFor({ state: 'visible' });
    await menuSlide.click();

    await page.waitForSelector('[data-testid="menu-photo-dialog"]', { state: 'visible' });

    const zoomInButton = page.getByTestId('zoom-in-button');
    const zoomOutButton = page.getByTestId('zoom-out-button');
    const zoomLevelIndicator = page.getByTestId('zoom-level-indicator');
    const photoContainer = page.getByTestId('zoomable-photo-container');

    // Zoom up to 2.5x
    await zoomInButton.click();
    await zoomInButton.click();
    await zoomInButton.click();
    await expect(zoomLevelIndicator).toHaveText('2.5x');

    // Zoom out step by step
    await zoomOutButton.click();
    await expect(zoomLevelIndicator).toHaveText('2.0x');

    await zoomOutButton.click();
    await zoomOutButton.click();
    await expect(zoomLevelIndicator).toHaveText('1.0x');

    // At minimum zoom
    await expect(zoomOutButton).toBeDisabled();
    await expect(photoContainer).toHaveCSS('cursor', 'default');
  });
});
