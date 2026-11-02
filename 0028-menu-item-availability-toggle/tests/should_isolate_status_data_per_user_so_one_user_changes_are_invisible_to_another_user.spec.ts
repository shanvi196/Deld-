import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';
const SECOND_USER = {
  email: 'mike.rodriguez@email.com',
  password: 'password123'
};

test('should isolate status data per user so one user changes are invisible to another user', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await homePage.goto();
  await page.evaluate(() => {
    localStorage.removeItem('deld-menu-availability-user_0001');
    localStorage.removeItem('deld-menu-availability-user_0002');
  });

  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();
  await page.waitForTimeout(1000);

  const menuItemCards = page.locator('[data-testid^="menu-item-card-"]');
  expect(await menuItemCards.count()).toBeGreaterThanOrEqual(2);
  const firstCardTestId = await menuItemCards.first().getAttribute('data-testid');
  const firstItemId = firstCardTestId!.replace('menu-item-card-', '');

  await page.getByTestId(`status-dropdown-trigger-${firstItemId}`).click();
  await page.waitForTimeout(500);
  await page.getByTestId('status-option-sold-out').click();
  await page.waitForTimeout(500);

  const firstItemCard = page.getByTestId(`menu-item-card-${firstItemId}`);
  await expect(firstItemCard.getByTestId('status-badge-sold-out')).toBeVisible();
  await expect(page.getByTestId('sold-out-count-badge')).toContainText('1 Sold Out');

  await homePage.topBar.openUserMenu();
  await homePage.topBar.userAvatarMenuLogout.click();
  await page.waitForTimeout(1000);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(SECOND_USER.email, SECOND_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();
  await page.waitForTimeout(1000);

  const allCards = page.locator('[data-testid^="menu-item-card-"]');
  const totalCards = await allCards.count();
  const availableBadges = page.getByTestId('status-badge-available');
  expect(await availableBadges.count()).toBe(totalCards);

  await expect(page.getByTestId('sold-out-count-badge')).not.toBeVisible();
  await expect(page.getByTestId('filter-chip-sold-out')).toContainText('Sold Out (0)');

  const user1Data = await page.evaluate(() => {
    return localStorage.getItem('deld-menu-availability-user_0001');
  });
  expect(user1Data).not.toBeNull();
  const parsedUser1Data = JSON.parse(user1Data!);
  expect(parsedUser1Data[TEST_RESTAURANT_ID][firstItemId]).toBe('sold-out');

  const user2Data = await page.evaluate(() => {
    return localStorage.getItem('deld-menu-availability-user_0002');
  });
  expect(user2Data).toBeNull();
});