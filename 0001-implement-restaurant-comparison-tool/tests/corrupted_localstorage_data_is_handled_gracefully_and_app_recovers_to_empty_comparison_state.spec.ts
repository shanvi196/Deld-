import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Corrupted localStorage data is handled gracefully and app recovers to empty comparison state', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate(() => {
    localStorage.setItem('comparisonList-user_0001', 'not-valid-json{[');
  });

  await homePage.goto();
  await homePage.expectRestaurantCardsToBeVisible();

  await expect(page.getByTestId('comparison-bar')).not.toBeVisible();
  await expect(page.getByTestId('header-comparison-badge')).not.toBeVisible();

  const firstRestaurantId = await homePage.getRestaurantIdFromCard(0);
  await expect(page.getByTestId(`restaurant-card-compare-button-${firstRestaurantId}`)).toHaveAttribute('aria-pressed', 'false');

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
  expect(typeof parsed[0].addedAt).toBe('string');
});