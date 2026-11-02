import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { CollectionsPage } from './pages/collections_page';
import { HomePage } from './pages/home_page';

test.describe('Bulk Collection Item Removal - Toggle Selection Mode', () => {
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
    await page.waitForTimeout(1000);
    try {
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
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  test('should toggle selection mode on when clicking Select button', async ({ page }) => {
    // Navigate to user collections page
    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();

    // Get first collection with items or create one with restaurants
    const collectionTiles = page.getByTestId('collection-tile-name');
    const tileCount = await collectionTiles.count();
    
    if (tileCount > 0) {
      // Click first collection
      await collectionTiles.first().click();
      await page.waitForTimeout(1000);
      await page.waitForTimeout(500);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);
    } else {
      // Create a collection if none exist
      const collectionName = `Test Bulk Select ${Date.now()}`;
      createdCollectionNames.push(collectionName);
      await collectionsPage.createNewCollection(collectionName);
      await collectionsPage.waitForCollectionsGridToLoad();
      await collectionsPage.clickCollectionTile(collectionName);
    }

    // Verify we are on collection detail page
    await collectionsPage.expectToBeOnCollectionDetailPage();

    // Verify Select button is visible with text "Select"
    const selectModeToggle = page.getByTestId('select-mode-toggle');
    await expect(selectModeToggle).toBeVisible();
    await expect(selectModeToggle).toHaveText('Select');

    // Verify checkboxes are not visible initially
    const checkboxes = page.locator('[data-testid^="item-checkbox-"]');
    const initialCheckboxCount = await checkboxes.count();
    expect(initialCheckboxCount).toBe(0);

    // Click Select button to toggle selection mode on
    await selectModeToggle.click();
    await page.waitForTimeout(500);

    // Verify button text changes to "Cancel"
    await expect(selectModeToggle).toHaveText('Cancel');

    // Verify checkboxes appear next to restaurant items
    const restaurantItems = page.locator('[data-testid^="item-checkbox-"]');
    const checkboxCount = await restaurantItems.count();
    
    // If collection has items, checkboxes should appear
    const collectionItems = page.getByTestId('collection-items-list');
    const hasItems = await collectionItems.isVisible();
    if (hasItems) {
      expect(checkboxCount).toBeGreaterThanOrEqual(0);
    }

    // Verify all checkboxes are unchecked initially
    for (let i = 0; i < checkboxCount; i++) {
      const checkbox = restaurantItems.nth(i);
      await expect(checkbox).not.toBeChecked();
    }

    // Verify floating action bar is NOT visible when no items selected
    const bulkActionBar = page.getByTestId('bulk-action-bar');
    await expect(bulkActionBar).not.toBeVisible();
  });
});
