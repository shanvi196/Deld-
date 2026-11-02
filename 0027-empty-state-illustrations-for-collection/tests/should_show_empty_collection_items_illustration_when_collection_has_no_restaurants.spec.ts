import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';
import { CollectionsPage } from './pages/collections_page';

test.describe('Empty Collection Items - Illustration', () => {
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
    const baseUrl = new URL(page.url()).origin;
    
    for (const collectionName of createdCollectionNames) {
      try {
        const collectionsResponse = await page.request.get(`${baseUrl}/api/collections`);
        if (collectionsResponse.ok()) {
          const collectionsData = await collectionsResponse.json();
          const collection = collectionsData.data?.collections?.find(
            (c: { name: string }) => c.name === collectionName
          );
          if (collection?.id) {
            await page.request.delete(`${baseUrl}/api/collections?collectionId=${collection.id}`);
          }
        }
      } catch (error) {
        console.error(`Cleanup error for ${collectionName}:`, error);
      }
    }
    createdCollectionNames.length = 0;
  });

  test('should show empty collection items illustration when collection has no restaurants', async ({ page }) => {
    const collectionName = `Test Empty Collection ${Date.now()}`;
    createdCollectionNames.push(collectionName);

    // Navigate to collections page and create a new collection
    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();
    
    await collectionsPage.createNewCollection(collectionName);
    await collectionsPage.waitForCollectionsGridToLoad();

    // Click on the collection to view details
    await collectionsPage.clickCollectionTile(collectionName);
    await collectionsPage.expectToBeOnCollectionDetailPage();
    await page.waitForTimeout(1000);

    // Verify empty collection items fallback is visible
    const emptyItemsFallback = page.getByTestId('no-collection-items-fallback');
    await expect(emptyItemsFallback).toBeVisible();

    // Verify SVG illustration is present
    const illustration = page.getByTestId('empty-collection-items-illustration');
    await expect(illustration).toBeVisible();
    const illustrationTag = await illustration.evaluate(el => el.tagName.toLowerCase());
    expect(illustrationTag).toBe('svg');

    // Verify text content
    await expect(page.getByText('This collection is empty')).toBeVisible();

    // Verify Browse Restaurants button
    const browseButton = page.getByRole('button', { name: /Browse Restaurants/i });
    await expect(browseButton).toBeVisible();
  });
});