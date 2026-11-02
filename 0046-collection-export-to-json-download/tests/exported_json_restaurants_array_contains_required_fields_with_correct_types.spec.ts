import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';
import { CollectionsPage } from './pages/collections_page';

test.describe('Collection Export - Restaurants array structure', () => {
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

  test('exported JSON restaurants array contains required fields with correct types', async ({ page }) => {
    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();
    const firstCollectionTile = page.locator('[data-testid^="collection-tile-"]').first();
    await firstCollectionTile.click();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-collection-button').click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) { chunks.push(chunk as Buffer); }
    const content = Buffer.concat(chunks).toString('utf-8');
    const json = JSON.parse(content);
    expect(json).toHaveProperty('restaurants');
    expect(Array.isArray(json.restaurants)).toBe(true);
    if (json.restaurants.length > 0) {
      const restaurant = json.restaurants[0];
      expect(restaurant).toHaveProperty('id');
      expect(typeof restaurant.id).toBe('string');
      expect(restaurant).toHaveProperty('name');
      expect(typeof restaurant.name).toBe('string');
      expect(restaurant).toHaveProperty('cuisine');
      expect(typeof restaurant.cuisine).toBe('string');
      expect(restaurant).toHaveProperty('rating');
      expect(typeof restaurant.rating).toBe('number');
      expect(restaurant.rating).toBeGreaterThanOrEqual(0);
      expect(restaurant.rating).toBeLessThanOrEqual(5);
      expect(restaurant).toHaveProperty('address');
      expect(typeof restaurant.address).toBe('string');
    }
  });
});