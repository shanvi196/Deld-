import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { CollectionsPage } from './pages/collections_page';
import { TEST_USER } from './fixtures/test_users';

test.describe('Plan Route button disabled with fewer than 2 restaurants', () => {
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

  test('should disable Plan Route button when collection has fewer than 2 restaurants', async ({ page }) => {
    const collectionsResponse = await page.request.get('http://localhost:3000/api/collections');
    const collectionsData = await collectionsResponse.json();
    const collections = collectionsData.data?.collections || [];
    
    let targetCollectionId = null;
    for (const collection of collections) {
      const itemsResponse = await page.request.get(`http://localhost:3000/api/collections/${collection.id}/restaurants`);
      const itemsData = await itemsResponse.json();
      const restaurantCount = itemsData.data?.restaurants?.length || 0;
      if (restaurantCount < 2) {
        targetCollectionId = collection.id;
        break;
      }
    }

    if (!targetCollectionId) {
      const collectionName = `Route Test Empty ${Date.now()}`;
      await collectionsPage.goto();
      await collectionsPage.waitForCollectionsGridToLoad();
      await collectionsPage.createNewCollection(collectionName);
      await collectionsPage.waitForCollectionsGridToLoad();
      await collectionsPage.clickCollectionTile(collectionName);
      await collectionsPage.expectToBeOnCollectionDetailPage();
    } else {
      await page.goto(`http://localhost:3000/user/collections/${targetCollectionId}`);
      await page.waitForTimeout(500);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);
    }

    await page.waitForTimeout(1000);

    const planRouteButton = page.getByTestId('plan-route-button');
    await expect(planRouteButton).toBeVisible();
    await expect(planRouteButton).toBeDisabled();

    const titleAttr = await planRouteButton.getAttribute('title');
    expect(titleAttr).toContain('Not enough restaurants');

    const polyline = page.getByTestId('route-polyline');
    await expect(polyline).not.toBeVisible();
  });
});