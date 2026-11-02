import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';

test.describe('Quick Save Button - Dialog Closes Without Navigation', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
    await page.waitForTimeout(1000);
  });

  test('clicking outside dialog closes it without navigating away', async ({ page }) => {
    await homePage.expectRestaurantCardsToBeVisible();

    const initialUrl = page.url();
    expect(initialUrl).toBe('http://localhost:3000/');

    const firstCard = page.locator('[data-testid^="restaurant-card-link-"]').first();
    await firstCard.hover();
    await page.waitForTimeout(500);

    const quickSaveButton = page.locator('[data-testid^="quick-save-button-"]').first();
    await expect(quickSaveButton).toBeVisible();

    await quickSaveButton.click();
    await page.waitForTimeout(500);

    const saveToCollectionDialog = page.getByTestId('save-to-collection-dialog');
    await expect(saveToCollectionDialog).toBeVisible();

    await page.mouse.click(10, 10);
    await page.waitForTimeout(500);

    await expect(saveToCollectionDialog).not.toBeVisible();

    expect(page.url()).toBe('http://localhost:3000/');

    const restaurantCards = page.locator('[data-testid^="restaurant-card-link-"]');
    await expect(restaurantCards).toHaveCount(10);
  });
});