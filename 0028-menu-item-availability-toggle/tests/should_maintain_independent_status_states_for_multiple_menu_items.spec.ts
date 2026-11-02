import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Multiple Menu Items Independent Status', () => {
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

  test('should maintain independent status states for multiple menu items', async ({ page }) => {
    const menuItemCards = page.locator('[data-testid^="menu-item-card-"]');
    await expect(menuItemCards.first()).toBeVisible();
    
    const cardCount = await menuItemCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(3);

    const firstCard = menuItemCards.nth(0);
    const firstTrigger = firstCard.locator('[data-testid^="status-dropdown-trigger-"]');
    await firstTrigger.click();
    await page.getByTestId('status-option-sold-out').click();

    const secondCard = menuItemCards.nth(1);
    const secondTrigger = secondCard.locator('[data-testid^="status-dropdown-trigger-"]');
    await secondTrigger.click();
    await page.getByTestId('status-option-limited').click();

    const thirdCard = menuItemCards.nth(2);
    const thirdTrigger = thirdCard.locator('[data-testid^="status-dropdown-trigger-"]');
    await thirdTrigger.click();
    await page.getByTestId('status-option-available').click();

    await expect(firstCard.locator('[data-testid="status-badge-sold-out"]')).toBeVisible();
    await expect(secondCard.locator('[data-testid="status-badge-limited"]')).toBeVisible();
    await expect(thirdCard.locator('[data-testid="status-badge-available"]')).toBeVisible();

    const storedData = await page.evaluate(() => localStorage.getItem('menuItemStatus'));
    expect(storedData).toBeTruthy();
    const parsedData = JSON.parse(storedData!);
    const restaurantItems = parsedData[TEST_RESTAURANT_ID];
    expect(restaurantItems).toBeDefined();
    expect(Object.keys(restaurantItems).length).toBe(3);
  });
});