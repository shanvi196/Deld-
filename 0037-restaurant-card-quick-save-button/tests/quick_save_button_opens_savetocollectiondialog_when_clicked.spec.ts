import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';

test.describe('Quick Save Button - Opens Dialog When Authenticated', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
    await page.waitForTimeout(1000);
  });

  test('quick save button opens SaveToCollectionDialog when clicked', async ({ page }) => {
    await homePage.expectRestaurantCardsToBeVisible();

    const firstCard = page.locator('[data-testid^="restaurant-card-link-"]').first();
    await firstCard.hover();
    await page.waitForTimeout(500);

    const quickSaveButton = page.locator('[data-testid^="quick-save-button-"]').first();
    await expect(quickSaveButton).toBeVisible();

    await quickSaveButton.click();
    await page.waitForTimeout(500);

    const saveToCollectionDialog = page.getByTestId('save-to-collection-dialog');
    await expect(saveToCollectionDialog).toBeVisible();

    const collectionItems = saveToCollectionDialog.locator('[data-testid^="collection-item-"]');
    const collectionCount = await collectionItems.count();
    expect(collectionCount).toBeGreaterThanOrEqual(1);

    const collectionNameInput = page.getByTestId('collection-name-input');
    await expect(collectionNameInput).toBeVisible();
  });
});