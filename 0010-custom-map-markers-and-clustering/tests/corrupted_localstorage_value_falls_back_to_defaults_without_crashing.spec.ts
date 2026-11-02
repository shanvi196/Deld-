import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Corrupted localStorage value falls back to defaults without crashing', async ({ page }) => {
  const homePage = new HomePage(page);
  const USER_ID = 'user_0001';
  const prefsKey = `deld-map-preferences-${USER_ID}`;

  // Login first
  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(2000);

  // Set corrupted localStorage
  await page.evaluate((key) => {
    localStorage.setItem(key, '{{not-json}}');
  }, prefsKey);

  // Reload page
  await homePage.goto();

  // Page should load without errors
  await homePage.expectRestaurantCardsToBeVisible();

  // Open panel - should show defaults
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(500);
  await expect(page.getByTestId('marker-style-pin')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('marker-color-red')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('toggle-labels-button')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('reset-preferences-button')).toBeDisabled();
  await expect(page.getByTestId('preferences-badge')).toHaveCount(0);

  // Change a preference
  await page.getByTestId('marker-color-blue').click();
  await page.waitForTimeout(500);

  // Verify valid JSON now saved
  const prefs = await page.evaluate((key) => {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }, prefsKey);
  expect(prefs).not.toBeNull();
  expect(prefs.markerColor).toBe('blue');
  expect(prefs.markerStyle).toBe('pin');
  expect(prefs.showLabels).toBe(false);
});