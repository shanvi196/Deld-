import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Photo Zoom Controls - Navigation Reset', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('zoom and pan state resets when navigating to different photo', async ({ page }) => {
    // Open menu photo
    const menuSlide = page.locator('[data-testid="menu-carousel-slide"]').first();
    await menuSlide.waitFor({ state: 'visible' });
    await menuSlide.click();

    await page.waitForSelector('[data-testid="menu-photo-dialog"]', { state: 'visible' });

    const zoomInButton = page.getByTestId('zoom-in-button');
    const zoomLevelIndicator = page.getByTestId('zoom-level-indicator');
    const photoContainer = page.getByTestId('zoomable-photo-container');

    // Zoom to 2.5x
    await zoomInButton.click();
    await zoomInButton.click();
    await zoomInButton.click();
    await expect(zoomLevelIndicator).toHaveText('2.5x');

    // Navigate to next photo
    const nextButton = page.locator(
      '[data-testid="menu-photo-dialog"] [data-testid="carousel-next-button"]'
    );
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    // Zoom should reset
    await expect(zoomLevelIndicator).toHaveText('1.0x');

    // 🔑 Browser-safe transform assertion
    const transform = await photoContainer.evaluate(
      el => getComputedStyle(el).transform
    );

    expect(
      transform === 'none' ||
      transform === 'matrix(1, 0, 0, 1, 0, 0)'
    ).toBe(true);

    // Cursor reset
    await expect(photoContainer).toHaveCSS('cursor', 'default');
  });
});
