import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Compare Now button state transitions and comparison page column removal updates table and localStorage', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate(() => localStorage.removeItem('comparisonList-user_0001'));
  await homePage.goto();

  const firstRestaurantId = await homePage.getRestaurantIdFromCard(0);
  const secondRestaurantId = await homePage.getRestaurantIdFromCard(1);

  await page.getByTestId(`restaurant-card-compare-button-${firstRestaurantId}`).click();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('comparison-bar')).toBeVisible();
  await expect(page.getByTestId('comparison-bar-compare-button')).toBeDisabled();

  await page.getByTestId(`restaurant-card-compare-button-${secondRestaurantId}`).click();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('comparison-bar')).toContainText('2 restaurants selected');
  await expect(page.getByTestId('comparison-bar-compare-button')).toBeEnabled();

  await page.getByTestId('comparison-bar-compare-button').click();
  await page.waitForTimeout(1000);

  expect(page.url()).toContain('/compare');

  await expect(page.getByTestId(`comparison-column-${firstRestaurantId}`)).toBeVisible();
  await expect(page.getByTestId(`comparison-column-${secondRestaurantId}`)).toBeVisible();

  await page.getByTestId(`comparison-column-remove-${firstRestaurantId}`).click();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId(`comparison-column-${firstRestaurantId}`)).not.toBeVisible();
  await expect(page.getByTestId(`comparison-column-${secondRestaurantId}`)).toBeVisible();

  const storageData = await page.evaluate(() => localStorage.getItem('comparisonList-user_0001'));
  const parsed = JSON.parse(storageData as string);
  expect(parsed.length).toBe(1);
  expect(parsed[0].restaurantId).toBe(secondRestaurantId);
});