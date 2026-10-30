import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('User isolation ensures switching accounts does not leak comparison data between users', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate(() => {
    localStorage.removeItem('comparisonList-user_0001');
    localStorage.removeItem('comparisonList-user_0002');
  });
  await homePage.goto();

  const firstRestaurantId = await homePage.getRestaurantIdFromCard(0);
  const secondRestaurantId = await homePage.getRestaurantIdFromCard(1);
  const thirdRestaurantId = await homePage.getRestaurantIdFromCard(2);

  await page.getByTestId(`restaurant-card-compare-button-${firstRestaurantId}`).click();
  await page.waitForTimeout(500);
  await page.getByTestId(`restaurant-card-compare-button-${secondRestaurantId}`).click();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('comparison-bar')).toContainText('2 restaurants selected');

  const user1Data = await page.evaluate(() => localStorage.getItem('comparisonList-user_0001'));
  expect(JSON.parse(user1Data as string).length).toBe(2);

  await homePage.topBar.openUserMenu();
  await homePage.topBar.userAvatarMenuLogout.click();
  await page.waitForTimeout(1000);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login('mike.rodriguez@email.com', 'password123');
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(1000);
  await homePage.goto();

  await expect(page.getByTestId('comparison-bar')).not.toBeVisible();
  await expect(page.getByTestId('header-comparison-badge')).not.toBeVisible();

  const user2Data = await page.evaluate(() => {
    const data = localStorage.getItem('comparisonList-user_0002');
    if (data === null) return [];
    return JSON.parse(data);
  });
  expect(user2Data.length).toBe(0);

  await expect(page.getByTestId(`restaurant-card-compare-button-${firstRestaurantId}`)).toHaveAttribute('aria-pressed', 'false');

  await page.getByTestId(`restaurant-card-compare-button-${thirdRestaurantId}`).click();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('comparison-bar')).toContainText('1 restaurant selected');

  const user2UpdatedData = await page.evaluate(() => localStorage.getItem('comparisonList-user_0002'));
  const user2Parsed = JSON.parse(user2UpdatedData as string);
  expect(user2Parsed.length).toBe(1);
  expect(user2Parsed[0].restaurantId).toBe(thirdRestaurantId);

  const user1StillData = await page.evaluate(() => localStorage.getItem('comparisonList-user_0001'));
  expect(JSON.parse(user1StillData as string).length).toBe(2);
});