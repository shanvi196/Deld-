import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Photo Zoom Controls - Reset', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('reset button returns zoom to 1x and resets pan position', async ({ page }) => {
    // Open menu photo
    const menuSlide = page.locator('[data-testid="menu-carousel-slide"]').first();
    await menuSlide.waitFor({ state: 'visible' });
    await menuSlide.click();

    await page.waitForSelector('[data-testid="menu-photo-dialog"]', { state: 'visible' });

    const zoomInButton = page.getByTestId('zoom-in-button');
    const zoomResetButton = page.getByTestId('zoom-reset-button');
    const zoomOutButton = page.getByTestId('zoom-out-button');
    const zoomLevelIndicator = page.getByTestId('zoom-level-indicator');
    const photoContainer = page.getByTestId('zoomable-photo-container');

    // Zoom in twice → 2.0x
    await zoomInButton.click();
    await zoomInButton.click();
    await expect(zoomLevelIndicator).toHaveText('2.0x');

    // Reset zoom
    await zoomResetButton.click();

    // Zoom reset assertions
    await expect(zoomLevelIndicator).toHaveText('1.0x');

    // 🔑 Accept browser-normalized transform
    const transform = await photoContainer.evaluate(
      el => getComputedStyle(el).transform
    );

    expect(
      transform === 'none' ||
      transform === 'matrix(1, 0, 0, 1, 0, 0)'
    ).toBe(true);

    // Buttons disabled at 1x
    await expect(zoomOutButton).toBeDisabled();
    await expect(zoomResetButton).toBeDisabled();
  });
});
