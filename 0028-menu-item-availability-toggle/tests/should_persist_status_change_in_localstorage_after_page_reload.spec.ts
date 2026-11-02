import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Status Persistence in localStorage', () => {
  let homePage: HomePage;
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    restaurantDetailsPage = new RestaurantDetailsPage(page);

    await homePage.goto();
    await page.evaluate(() => localStorage.removeItem('menuItemStatus'));
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();

    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('should persist status change in localStorage after page reload', async ({ page }) => {
    const firstMenuItemCard = page.locator('[data-testid^="menu-item-card-"]').first();
    await expect(firstMenuItemCard).toBeVisible();
    
    const testId = await firstMenuItemCard.getAttribute('data-testid');
    const menuItemId = testId?.replace('menu-item-card-', '');
    expect(menuItemId).toBeTruthy();

    const dropdownTrigger = firstMenuItemCard.locator('[data-testid^="status-dropdown-trigger-"]');
    await dropdownTrigger.click();

    const soldOutOption = page.getByTestId('status-option-sold-out');
    await soldOutOption.click();

    const soldOutBadge = firstMenuItemCard.locator('[data-testid="status-badge-sold-out"]');
    await expect(soldOutBadge).toBeVisible();

    await page.reload();
    await restaurantDetailsPage.waitForPageLoad();

    const statusBadgeAfterReload = page.locator(`[data-testid="menu-item-card-${menuItemId}"]`)
      .locator('[data-testid="status-badge-sold-out"]');
    await expect(statusBadgeAfterReload).toBeVisible({ timeout: 10000 });

    const storedData = await page.evaluate(() => localStorage.getItem('menuItemStatus'));
    expect(storedData).toBeTruthy();
    const parsedData = JSON.parse(storedData!);
    expect(parsedData[TEST_RESTAURANT_ID]).toBeDefined();
    expect(parsedData[TEST_RESTAURANT_ID][menuItemId!]).toBe('sold-out');
  });
});