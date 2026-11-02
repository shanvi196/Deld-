import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Quick Save Button - Login Dialog for Guests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('quick save button shows login dialog for unauthenticated users', async ({ page }) => {
    await homePage.expectRestaurantCardsToBeVisible();

    const firstCard = page.locator('[data-testid^="restaurant-card-link-"]').first();
    await firstCard.hover();
    await page.waitForTimeout(500);

    const quickSaveButton = page.locator('[data-testid^="quick-save-button-"]').first();
    await expect(quickSaveButton).toBeVisible();

    await quickSaveButton.click();

    const loginDialog = page.getByTestId('login-dialog');
    await expect(loginDialog).toBeVisible({ timeout: 500 });

    expect(page.url()).toBe('http://localhost:3000/');

    const restaurantCards = page.locator('[data-testid^="restaurant-card-link-"]');
    await expect(restaurantCards.first()).toBeVisible();
  });
});