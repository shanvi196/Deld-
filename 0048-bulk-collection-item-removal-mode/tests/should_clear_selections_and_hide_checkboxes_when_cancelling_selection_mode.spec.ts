import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { CollectionsPage } from './pages/collections_page';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID_1 = '25047088-5a40-4fab-be5c-3ee9a54fb980';
const TEST_RESTAURANT_ID_2 = 'dc553a2b-ac48-4126-964b-bd95e45e5670';

test.describe('Bulk Collection Item Removal - Cancel Selection Mode', () => {
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

  test('should clear selections and hide checkboxes when cancelling selection mode', async ({ page }) => {
    // Create collection with 2 restaurants
    const collectionName = `Cancel Mode Test ${Date.now()}`;
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

    // Toggle selection mode on
    const selectModeToggle = page.getByTestId('select-mode-toggle');
    await selectModeToggle.click();
    await page.waitForTimeout(500);

    const checkboxes = page.locator('[data-testid^="item-checkbox-"]');
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThanOrEqual(2);

    // Select both items
    await checkboxes.first().click();
    await page.waitForTimeout(300);
    await checkboxes.nth(1).click();
    await page.waitForTimeout(300);

    // Verify action bar is visible
    const bulkActionBar = page.getByTestId('bulk-action-bar');
    await expect(bulkActionBar).toBeVisible();

    // Click Cancel button to exit selection mode
    await expect(selectModeToggle).toHaveText('Cancel');
    await selectModeToggle.click();
    await page.waitForTimeout(500);

    // Verify checkboxes are hidden
    const checkboxesAfterCancel = page.locator('[data-testid^="item-checkbox-"]');
    const checkboxCountAfter = await checkboxesAfterCancel.count();
    expect(checkboxCountAfter).toBe(0);

    // Verify action bar is hidden
    await expect(bulkActionBar).not.toBeVisible();

    // Verify button text is back to "Select"
    await expect(selectModeToggle).toHaveText('Select');

    // Toggle selection mode on again
    await selectModeToggle.click();
    await page.waitForTimeout(500);

    // Verify all checkboxes are unchecked (no remembered selections)
    const newCheckboxes = page.locator('[data-testid^="item-checkbox-"]');
    const newCheckboxCount = await newCheckboxes.count();
    for (let i = 0; i < newCheckboxCount; i++) {
      await expect(newCheckboxes.nth(i)).not.toBeChecked();
    }
  });
});
