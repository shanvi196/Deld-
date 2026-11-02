import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Reset button restores defaults and removes Custom Map View chip on detail page', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  // Login
  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(2000);
  await homePage.goto();

  // Open panel - reset should be disabled at defaults
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(500);
  await expect(page.getByTestId('reset-preferences-button')).toBeDisabled();

  // Change color and style
  await page.getByTestId('marker-color-green').click();
  await page.waitForTimeout(300);
  await page.getByTestId('marker-style-circle').click();
  await page.waitForTimeout(300);

  // Reset should be enabled, badge shows 2
  await expect(page.getByTestId('reset-preferences-button')).toBeEnabled();
  await expect(page.getByTestId('preferences-badge')).toHaveText('2');

  // Navigate to restaurant detail page
  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await page.waitForTimeout(1000);

  // Custom Map View chip should be visible
  await expect(page.getByTestId('map-customized-indicator')).toBeVisible();
  await expect(page.getByTestId('map-customized-indicator')).toContainText('Custom Map View');

  // Go back to home
  await homePage.goto();

  // Open panel and reset
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(500);
  await page.getByTestId('reset-preferences-button').click();
  await page.waitForTimeout(500);

  // Verify defaults restored
  await expect(page.getByTestId('marker-color-red')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('marker-style-pin')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('reset-preferences-button')).toBeDisabled();
  await expect(page.getByTestId('preferences-badge')).toHaveCount(0);

  // Navigate to detail page again - chip should be gone
  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await page.waitForTimeout(1000);
  await expect(page.getByTestId('map-customized-indicator')).toHaveCount(0);
});