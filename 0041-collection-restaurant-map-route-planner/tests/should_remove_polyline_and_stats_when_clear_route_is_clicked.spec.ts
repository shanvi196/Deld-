import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test.describe('Clear Route button removes polyline and stats panel', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);

    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test('should remove polyline and stats when Clear Route is clicked', async ({ page }) => {
    const collectionsResponse = await page.request.get('http://localhost:3000/api/collections');
    const collectionsData = await collectionsResponse.json();
    const collections = collectionsData.data?.collections || [];
    
    let targetCollectionId = null;
    for (const collection of collections) {
      const itemsResponse = await page.request.get(`http://localhost:3000/api/collections/${collection.id}/restaurants`);
      const itemsData = await itemsResponse.json();
      const restaurantCount = itemsData.data?.restaurants?.length || 0;
      if (restaurantCount >= 3) {
        targetCollectionId = collection.id;
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

    const clearRouteButton = page.getByTestId('clear-route-button');
    await clearRouteButton.click();
    await page.waitForTimeout(1000);

    await expect(polyline).not.toBeVisible();
    await expect(routeStats).not.toBeVisible();

    const planRouteButtonAfter = page.getByTestId('plan-route-button');
    await expect(planRouteButtonAfter).toBeVisible();
    await expect(planRouteButtonAfter).toBeEnabled();
  });
});