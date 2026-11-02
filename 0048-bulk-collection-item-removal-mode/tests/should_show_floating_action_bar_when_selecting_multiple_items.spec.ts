import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { CollectionsPage } from './pages/collections_page';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID_1 = '25047088-5a40-4fab-be5c-3ee9a54fb980';
const TEST_RESTAURANT_ID_2 = 'dc553a2b-ac48-4126-964b-bd95e45e5670';

test.describe('Bulk Collection Item Removal - Select Multiple Items', () => {
  let homePage: HomePage;
  let collectionsPage: CollectionsPage;
  let restaurantDetailsPage: RestaurantDetailsPage;
  const createdCollectionNames: string[] = [];

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    collectionsPage = new CollectionsPage(page);
    restaurantDetailsPage = new RestaurantDetailsPage(page);

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

  test('should show floating action bar when selecting multiple items', async ({ page }) => {
    // Create a new collection with restaurants
    const collectionName = `Multi Select Test ${Date.now()}`;
    createdCollectionNames.push(collectionName);

    // First add restaurants to a collection via restaurant detail pages
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID_1);
    await restaurantDetailsPage.waitForPageLoad();
    await restaurantDetailsPage.clickSaveButton();
    await page.waitForTimeout(500);
    const newCollectionButton = page.getByRole('button', { name: /save to a new collection/i });
    await newCollectionButton.click();
    await restaurantDetailsPage.createNewCollection(collectionName);
    await page.waitForTimeout(1000);

    // Add second restaurant to same collection
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID_2);
    await restaurantDetailsPage.waitForPageLoad();
    await restaurantDetailsPage.clickSaveButton();
    await page.waitForTimeout(500);
    
    // Select the existing collection
    const collectionItem = page.locator('[data-testid="collection-item-name"]', { hasText: collectionName });
    await collectionItem.click();
    await page.waitForTimeout(1000);

    // Navigate to collection detail page
    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();
    await collectionsPage.clickCollectionTile(collectionName);
    await page.waitForTimeout(1000);

    // Toggle selection mode on
    const selectModeToggle = page.getByTestId('select-mode-toggle');
    await expect(selectModeToggle).toBeVisible();
    await selectModeToggle.click();
    await page.waitForTimeout(500);

    // Verify checkboxes are visible
    const checkboxes = page.locator('[data-testid^="item-checkbox-"]');
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThanOrEqual(2);

    // Click first checkbox
    await checkboxes.first().click();
    await page.waitForTimeout(300);

    // Click second checkbox
    await checkboxes.nth(1).click();
    await page.waitForTimeout(300);

    // Verify floating action bar appears
    const bulkActionBar = page.getByTestId('bulk-action-bar');
    await expect(bulkActionBar).toBeVisible();

    // Verify Remove Selected button shows correct count
    const removeSelectedButton = page.getByTestId('remove-selected-button');
    await expect(removeSelectedButton).toBeVisible();
    await expect(removeSelectedButton).toContainText('Remove Selected (2)');

    // Verify floating action bar is positioned at bottom
    const boundingBox = await bulkActionBar.boundingBox();
    const viewportSize = page.viewportSize();
    if (boundingBox && viewportSize) {
      const bottomDistance = viewportSize.height - (boundingBox.y + boundingBox.height);
      expect(bottomDistance).toBeLessThanOrEqual(50);
    }
  });
});
