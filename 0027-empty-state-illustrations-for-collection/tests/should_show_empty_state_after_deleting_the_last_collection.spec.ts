import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';
import { CollectionsPage } from './pages/collections_page';

test.describe('Empty State - Reappears After Deleting Last Collection', () => {
  let homePage: HomePage;
  let collectionsPage: CollectionsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    collectionsPage = new CollectionsPage(page);

    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();

    // Delete all collections to start clean
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

  test('should show empty state after deleting the last collection', async ({ page }) => {
    // Navigate to collections page - should show empty state since we deleted all
    await collectionsPage.goto();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    // Verify empty state is showing initially (we deleted all in beforeEach)
    const emptyState = page.getByTestId('empty-collections-state');
    await expect(emptyState).toBeVisible();

    // Create one collection using the empty state CTA button
    const collectionName = `My Only Collection ${Date.now()}`;
    const ctaButton = page.getByTestId('create-first-collection-button');
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();
    await page.waitForTimeout(500);

    const collectionNameInput = page.getByTestId('collection-name-input');
    await collectionNameInput.fill(collectionName);
    
    const saveButton = page.getByTestId('save-collection-button');
    await saveButton.click();
    await page.waitForTimeout(1000);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Verify collections grid shows exactly 1 collection
    const collectionsGrid = page.getByTestId('collections-grid');
    await expect(collectionsGrid).toBeVisible();
    
    const collectionTiles = page.getByTestId('collection-tile');
    await expect(collectionTiles).toHaveCount(1);

    // Click on the collection to go to detail page
    await collectionsPage.clickCollectionTile(collectionName);
    await collectionsPage.expectToBeOnCollectionDetailPage();

    // Click delete button
    await collectionsPage.expectRemoveCollectionButtonToBeVisible();
    await collectionsPage.clickRemoveCollection();
    await collectionsPage.expectRemoveCollectionDialogToBeVisible();

    // Confirm deletion
    await collectionsPage.clickConfirmRemove();
    await page.waitForTimeout(1000);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Should be redirected to collections page
    await collectionsPage.expectToBeOnCollectionsPage();

    // Verify collections grid is no longer visible
    await expect(collectionsGrid).not.toBeVisible();

    // Verify empty state is visible again
    await expect(emptyState).toBeVisible();
    await expect(page.getByText('No collections yet')).toBeVisible();
  });
});