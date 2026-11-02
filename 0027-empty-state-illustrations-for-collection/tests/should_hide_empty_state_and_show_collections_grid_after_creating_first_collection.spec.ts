import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';
import { CollectionsPage } from './pages/collections_page';

test.describe('Empty State - Disappears After Collection Created', () => {
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

    // Delete all collections to ensure empty state
    const baseUrl = new URL(page.url()).origin;
    const collectionsResponse = await page.request.get(`${baseUrl}/api/collections`);
    
    if (collectionsResponse.ok()) {
      const collectionsData = await collectionsResponse.json();
      const collections = collectionsData.data?.collections || [];
      
      for (const collection of collections) {
        if (collection?.id) {
          await page.request.delete(`${baseUrl}/api/collections?collectionId=${collection.id}`);
        }
      }
    }
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

  test('should hide empty state and show collections grid after creating first collection', async ({ page }) => {
    await page.goto('http://localhost:3000/user/collections');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    // Verify empty state is visible initially
    const emptyState = page.getByTestId('empty-collections-state');
    await expect(emptyState).toBeVisible();

    // Click create first collection button
    const ctaButton = page.getByTestId('create-first-collection-button');
    await ctaButton.click();
    await page.waitForTimeout(500);

    // Fill in collection name and submit
    const collectionName = 'My New Collection';
    createdCollectionNames.push(collectionName);
    
    const collectionNameInput = page.getByTestId('collection-name-input');
    await collectionNameInput.fill(collectionName);
    
    const saveButton = page.getByTestId('save-collection-button');
    await saveButton.click();
    await page.waitForTimeout(1000);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Verify empty state is no longer visible
    await expect(emptyState).not.toBeVisible();

    // Verify collections grid is visible
    const collectionsGrid = page.getByTestId('collections-grid');
    await expect(collectionsGrid).toBeVisible();

    // Verify exactly 1 collection tile exists
    const collectionTiles = page.getByTestId('collection-tile');
    await expect(collectionTiles).toHaveCount(1);

    // Verify the collection name is displayed
    await expect(page.getByTestId('collection-tile-name').filter({ hasText: collectionName })).toBeVisible();
  });
});