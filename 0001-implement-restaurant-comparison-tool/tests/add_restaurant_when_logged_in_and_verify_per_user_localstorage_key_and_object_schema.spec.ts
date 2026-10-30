import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Add restaurant when logged in and verify per-user localStorage key and object schema', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate(() => localStorage.removeItem('comparisonList-user_0001'));
  await homePage.goto();

  const firstRestaurantId = await homePage.getRestaurantIdFromCard(0);

  await page.getByTestId(`restaurant-card-compare-button-${firstRestaurantId}`).click();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId(`restaurant-card-compare-button-${firstRestaurantId}`)).toHaveAttribute('aria-pressed', 'true');

  await expect(page.getByTestId('comparison-bar')).toBeVisible();
  await expect(page.getByTestId('comparison-bar')).toContainText('1 restaurant selected');

  const storageData = await page.evaluate(() => localStorage.getItem('comparisonList-user_0001'));
  expect(storageData).not.toBeNull();

  const parsed = JSON.parse(storageData as string);
  expect(Array.isArray(parsed)).toBe(true);
  expect(parsed.length).toBe(1);
  expect(typeof parsed[0].restaurantId).toBe('string');
  expect(parsed[0].restaurantId).toBe(firstRestaurantId);
  expect(typeof parsed[0].addedAt).toBe('string');
  expect(isNaN(Date.parse(parsed[0].addedAt))).toBe(false);
});