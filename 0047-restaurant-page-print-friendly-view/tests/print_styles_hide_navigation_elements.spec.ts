import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Print Styles Hide Navigation', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test('print styles hide navigation elements', async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();

    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);

    let hiddenElementCount = 0;

    const searchBarHeader = page.getByTestId('search-bar-header');
    const searchBarCount = await searchBarHeader.count();
    if (searchBarCount > 0) {
      const display = await searchBarHeader.evaluate((el) => getComputedStyle(el).display);
      expect(display).toBe('none');
      hiddenElementCount++;
    }

    const mainNavigation = page.getByTestId('main-navigation');
    const mainNavCount = await mainNavigation.count();
    if (mainNavCount > 0) {
      const display = await mainNavigation.evaluate((el) => getComputedStyle(el).display);
      expect(display).toBe('none');
      hiddenElementCount++;
    }

    const mapContainer = page.locator('[data-testid="location-map"], [data-testid="map-container"], .leaflet-container').first();
    const mapCount = await mapContainer.count();
    if (mapCount > 0) {
      const display = await mapContainer.evaluate((el) => getComputedStyle(el).display);
      expect(display).toBe('none');
      hiddenElementCount++;
    }

    expect(hiddenElementCount).toBeGreaterThan(0);
  });
});