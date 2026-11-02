import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';

test.describe('Quick Save Button - Filled State for Saved Restaurants', () => {
  let homePage: HomePage;
  const testCollectionName = `Test Favorites ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
    await page.waitForTimeout(1000);
  });

  test('bookmark icon shows filled state for saved restaurants', async ({ page }) => {
    await homePage.expectRestaurantCardsToBeVisible();

    const firstCard = page.locator('[data-testid^="restaurant-card-link-"]').first();
    const firstCardTestId = await firstCard.getAttribute('data-testid');
    const restaurantId = firstCardTestId?.replace('restaurant-card-link-', '');

    await firstCard.hover();
    await page.waitForTimeout(500);

    const quickSaveButton = page.getByTestId(`quick-save-button-${restaurantId}`);
    await expect(quickSaveButton).toBeVisible();

    await quickSaveButton.click();
    await page.waitForTimeout(500);

    const saveToCollectionDialog = page.getByTestId('save-to-collection-dialog');
    await expect(saveToCollectionDialog).toBeVisible();

    const collectionNameInput = page.getByTestId('collection-name-input');
    await collectionNameInput.fill(testCollectionName);

    const saveButton = page.getByTestId('save-collection-button');
    await saveButton.click();
    await page.waitForTimeout(1000);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    await firstCard.hover();
    await page.waitForTimeout(500);

    await expect(quickSaveButton).toBeVisible();

    const filledIcon = quickSaveButton.locator('svg[data-filled="true"]');
    await expect(filledIcon).toBeVisible();
  });
});