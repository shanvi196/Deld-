import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Guest preferences migrate to user key on login when user has no existing preferences', async ({ page }) => {
  const homePage = new HomePage(page);
  const USER_ID = 'user_0001';
  const userPrefsKey = `deld-map-preferences-${USER_ID}`;
  const guestPrefsKey = 'deld-map-preferences-guest';

  // Go to home as guest
  await homePage.goto();

  // Ensure no existing user prefs
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, userPrefsKey);

  // Open panel and set orange as guest
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(500);
  await page.getByTestId('marker-color-orange').click();
  await page.waitForTimeout(500);

  // Verify guest key
  const guestPrefs = await page.evaluate((key) => {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }, guestPrefsKey);
  expect(guestPrefs).not.toBeNull();
  expect(guestPrefs.markerColor).toBe('orange');

  // Close panel before login
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(300);

  // Login
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(2000);
  await homePage.goto();
  await page.waitForTimeout(1000);

  // Verify user key has migrated prefs
  const userPrefs = await page.evaluate((key) => {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }, userPrefsKey);
  expect(userPrefs).not.toBeNull();
  expect(userPrefs.markerColor).toBe('orange');

  // Verify guest key removed
  const guestPrefsAfter = await page.evaluate((key) => {
    return localStorage.getItem(key);
  }, guestPrefsKey);
  expect(guestPrefsAfter).toBeNull();

  // Verify orange active in UI
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(500);
  await expect(page.getByTestId('marker-color-orange')).toHaveAttribute('aria-pressed', 'true');
});