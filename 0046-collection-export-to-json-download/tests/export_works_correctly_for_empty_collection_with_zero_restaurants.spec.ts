import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';
import { CollectionsPage } from './pages/collections_page';

test.describe('Collection Export - Empty collection export', () => {
  let homePage: HomePage;
  let collectionsPage: CollectionsPage;
  const createdCollectionNames: string[] = [];

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    collectionsPage = new CollectionsPage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test.afterEach(async ({ page }) => {
    try {
      const baseUrl = new URL(page.url()).origin;
      for (const collectionName of createdCollectionNames) {
        const collectionsResponse = await page.request.get(`${baseUrl}/api/collections`);
        if (collectionsResponse.ok()) {
          const collectionsData = await collectionsResponse.json();
          const collection = collectionsData.data?.collections?.find((c: { name: string }) => c.name === collectionName);
          if (collection?.id) {
            await page.request.delete(`${baseUrl}/api/collections?collectionId=${collection.id}`);
          }
        }
      }
      createdCollectionNames.length = 0;
    } catch (error) {
      console.error('CLEANUP: Error occurred:', error);
    }
  });

  test('export works correctly for empty collection with zero restaurants', async ({ page }) => {
    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();
    const emptyCollectionName = `Empty Export Test ${Date.now()}`;
    createdCollectionNames.push(emptyCollectionName);
    await collectionsPage.createNewCollection(emptyCollectionName);
    await collectionsPage.waitForCollectionsGridToLoad();
    await collectionsPage.clickCollectionTile(emptyCollectionName);
    await collectionsPage.expectToBeOnCollectionDetailPage();
    await page.waitForTimeout(1000);
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-collection-button').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.json$/);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) { chunks.push(chunk as Buffer); }
    const content = Buffer.concat(chunks).toString('utf-8');
    const json = JSON.parse(content);
    expect(json).toHaveProperty('restaurants');
    expect(Array.isArray(json.restaurants)).toBe(true);
    expect(json.restaurants).toHaveLength(0);
    expect(json).toHaveProperty('name');
    expect(typeof json.name).toBe('string');
    expect(json).toHaveProperty('createdAt');
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    expect(json.createdAt).toMatch(dateRegex);
  });
});