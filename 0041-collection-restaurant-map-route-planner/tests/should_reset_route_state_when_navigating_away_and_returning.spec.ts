import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { CollectionsPage } from './pages/collections_page';
import { TEST_USER } from './fixtures/test_users';

test.describe('Route state resets when navigating away and returning', () => {
  let homePage: HomePage;
  let collectionsPage: CollectionsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    collectionsPage = new CollectionsPage(page);

    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test('should reset route state when navigating away and returning', async ({ page }) => {
    const collectionsResponse = await page.request.get('http://localhost:3000/api/collections');
    const collectionsData = await collectionsResponse.json();
    const collections = collectionsData.data?.collections || [];
    
    let targetCollectionId = null;
    let targetCollectionName = null;
    for (const collection of collections) {
      const itemsResponse = await page.request.get(`http://localhost:3000/api/collections/${collection.id}/restaurants`);
      const itemsData = await itemsResponse.json();
      const restaurantCount = itemsData.data?.restaurants?.length || 0;
      if (restaurantCount >= 3) {
        targetCollectionId = collection.id;
        targetCollectionName = collection.name;
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

    await page.goto('http://localhost:3000/user/collections');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    await page.goto(`http://localhost:3000/user/collections/${targetCollectionId}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const polylineAfter = page.getByTestId('route-polyline');
    await expect(polylineAfter).not.toBeVisible();

    const routeStats = page.getByTestId('route-stats');
    await expect(routeStats).not.toBeVisible();

    const planRouteButtonAfter = page.getByTestId('plan-route-button');
    await expect(planRouteButtonAfter).toBeVisible();
    await expect(planRouteButtonAfter).toBeEnabled();

    const buttonText = await planRouteButtonAfter.textContent();
    expect(buttonText).toBe('Plan Route');
  });
});