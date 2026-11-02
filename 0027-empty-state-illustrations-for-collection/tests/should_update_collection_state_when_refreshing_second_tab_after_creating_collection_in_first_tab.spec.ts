import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';
import { CollectionsPage } from './pages/collections_page';

test.describe('Collection State - Cross Tab Updates', () => {
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

  test('should update collection state when refreshing second tab after creating collection in first tab', async ({ page, context }) => {
    // First tab - verify empty state
    await page.goto('http://localhost:3000/user/collections');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const emptyState = page.getByTestId('empty-collections-state');
    await expect(emptyState).toBeVisible();

    // Open second tab
    const secondTab = await context.newPage();
    await secondTab.goto('http://localhost:3000/user/collections');
    await secondTab.waitForLoadState('domcontentloaded');
    await secondTab.waitForTimeout(1000);

    // Second tab should also show empty state
    const secondTabEmptyState = secondTab.getByTestId('empty-collections-state');
    await expect(secondTabEmptyState).toBeVisible();

    // In first tab, create a collection
    const ctaButton = page.getByTestId('create-first-collection-button');
    await ctaButton.click();
    await page.waitForTimeout(500);

    const collectionName = 'Cross Tab Collection';
    createdCollectionNames.push(collectionName);
    
    const collectionNameInput = page.getByTestId('collection-name-input');
    await collectionNameInput.fill(collectionName);
    
    const saveButton = page.getByTestId('save-collection-button');
    await saveButton.click();
    await page.waitForTimeout(1000);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // First tab should now show collections grid
    const collectionsGrid = page.getByTestId('collections-grid');
    await expect(collectionsGrid).toBeVisible();

    // Refresh second tab
    await secondTab.reload();
    await secondTab.waitForLoadState('domcontentloaded');
    await secondTab.waitForTimeout(1000);

    // Second tab should now show collections grid with the new collection
    const secondTabCollectionsGrid = secondTab.getByTestId('collections-grid');
    await expect(secondTabCollectionsGrid).toBeVisible();

    // Verify collection tile with correct name
    const secondTabCollectionTiles = secondTab.getByTestId('collection-tile');
    await expect(secondTabCollectionTiles).toHaveCount(1);
    await expect(secondTab.getByTestId('collection-tile-name').filter({ hasText: collectionName })).toBeVisible();

    // Empty state should not be present
    await expect(secondTabEmptyState).not.toBeVisible();

    await secondTab.close();
  });
});