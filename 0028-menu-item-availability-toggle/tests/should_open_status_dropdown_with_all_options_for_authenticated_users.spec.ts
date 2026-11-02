import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Status Dropdown for Authenticated Users', () => {
  let homePage: HomePage;
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    restaurantDetailsPage = new RestaurantDetailsPage(page);

    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('should open status dropdown with all options for authenticated users', async ({ page }) => {
    // const menuItemsSection = page.locator('[data-testid="menu-items-section"]');
    // await menuItemsSection.scrollIntoViewIfNeeded();
    // await page.waitForTimeout(1000);

    const firstMenuItemCard = page.locator('[data-testid^="menu-item-card-"]').first();
    await expect(firstMenuItemCard).toBeVisible();

    const dropdownTrigger = firstMenuItemCard.locator('[data-testid^="status-dropdown-trigger-"]');
    await dropdownTrigger.click();
    await page.waitForTimeout(500);

    const availableOption = page.getByTestId('status-option-available');
    const limitedOption = page.getByTestId('status-option-limited');
    const soldOutOption = page.getByTestId('status-option-sold-out');

    await expect(availableOption).toBeVisible();
    await expect(limitedOption).toBeVisible();
    await expect(soldOutOption).toBeVisible();

    await expect(availableOption).toContainText('Available');
    await expect(limitedOption).toContainText('Limited');
    await expect(soldOutOption).toContainText('Sold Out');
  });
});