import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { CollectionsPage } from './pages/collections_page';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID_1 = '25047088-5a40-4fab-be5c-3ee9a54fb980';
const TEST_RESTAURANT_ID_2 = 'dc553a2b-ac48-4126-964b-bd95e45e5670';

test.describe('Bulk Collection Item Removal - Empty State', () => {
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

  test('should show empty state when removing all items from collection', async ({ page }) => {
    // Create collection with 2 restaurants
    const collectionName = `Empty State Test ${Date.now()}`;
    createdCollectionNames.push(collectionName);

    // Add first restaurant
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID_1);
    await restaurantDetailsPage.waitForPageLoad();
    await restaurantDetailsPage.clickSaveButton();
    await page.waitForTimeout(500);
    const newCollectionButton = page.getByRole('button', { name: /save to a new collection/i });
    await newCollectionButton.click();
    await restaurantDetailsPage.createNewCollection(collectionName);
    await page.waitForTimeout(1000);

    // Add second restaurant
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID_2);
    await restaurantDetailsPage.waitForPageLoad();
    await restaurantDetailsPage.clickSaveButton();
    await page.waitForTimeout(500);
    const collectionItem = page.locator('[data-testid="collection-item-name"]', { hasText: collectionName });
    await collectionItem.click();
    await page.waitForTimeout(1000);

    // Navigate to collection
    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();
    await collectionsPage.clickCollectionTile(collectionName);
    await page.waitForTimeout(1000);

    // Toggle selection mode
    const selectModeToggle = page.getByTestId('select-mode-toggle');
    await selectModeToggle.click();
    await page.waitForTimeout(500);

    // Select all items
    const checkboxes = page.locator('[data-testid^="item-checkbox-"]');
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThanOrEqual(2);
    
    for (let i = 0; i < checkboxCount; i++) {
      await checkboxes.nth(i).click();
      await page.waitForTimeout(200);
    }

    // Click Remove Selected
    const removeSelectedButton = page.getByTestId('remove-selected-button');
    await removeSelectedButton.click();
    await page.waitForTimeout(500);

    // Confirm removal
    const confirmButton = page.getByTestId('bulk-remove-confirm');
    await confirmButton.click();
    await page.waitForTimeout(2000);

    // Verify empty state message appears
    const emptyStateMessage = page.getByText(/no restaurants in this collection/i);
    await expect(emptyStateMessage).toBeVisible({ timeout: 5000 });

    // Verify Select button is no longer visible or is disabled when collection is empty
    const selectButton = page.getByTestId('select-mode-toggle');
    const selectButtonVisible = await selectButton.isVisible();
    
    if (selectButtonVisible) {
      // If visible, it should be disabled
      await expect(selectButton).toBeDisabled();
    }
    // If not visible, that's also acceptable behavior for empty collection
  });
});
