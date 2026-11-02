import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test.describe('Removing restaurant from collection clears route', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);

    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test('should clear route when a restaurant is removed from collection', async ({ page }) => {
    const collectionsResponse = await page.request.get('http://localhost:3000/api/collections');
    const collectionsData = await collectionsResponse.json();
    const collections = collectionsData.data?.collections || [];
    
    let targetCollectionId = null;
    let initialRestaurantCount = 0;
    for (const collection of collections) {
      const itemsResponse = await page.request.get(`http://localhost:3000/api/collections/${collection.id}/restaurants`);
      const itemsData = await itemsResponse.json();
      const restaurantCount = itemsData.data?.restaurants?.length || 0;
      if (restaurantCount >= 3) {
        targetCollectionId = collection.id;
        initialRestaurantCount = restaurantCount;
        break;
      }
    }

    if (!targetCollectionId) {
      test.skip();
      return;
    }

    await page.goto(`http://localhost:3000/user/collections/${targetCollectionId}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const planRouteButton = page.getByTestId('plan-route-button');
    await planRouteButton.click();
    await page.waitForTimeout(1000);

    const polyline = page.getByTestId('route-polyline');
    await expect(polyline).toBeVisible();

    const routeStats = page.getByTestId('route-stats');
    await expect(routeStats).toBeVisible();

    const removeButton = page.getByTestId('remove-restaurant-0');
    await removeButton.click();
    await page.waitForTimeout(1000);

    await expect(polyline).not.toBeVisible();
    await expect(routeStats).not.toBeVisible();

    const markers = page.locator('.leaflet-marker-icon');
    await expect(markers).toHaveCount(initialRestaurantCount - 1);

    const planRouteButtonAfter = page.getByTestId('plan-route-button');
    await expect(planRouteButtonAfter).toBeVisible();
    const buttonText = await planRouteButtonAfter.textContent();
    expect(buttonText).toBe('Plan Route');
  });
});