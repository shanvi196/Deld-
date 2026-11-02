import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('User preferences are isolated per user and not affected by guest activity', async ({ page }) => {
  const homePage = new HomePage(page);
  const USER_ID = 'user_0001';
  const userPrefsKey = `deld-map-preferences-${USER_ID}`;

  // Login
  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(2000);
  await homePage.goto();

  // Open panel and set preferences: circle, green, labels on
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(500);
  await page.getByTestId('marker-style-circle').click();
  await page.waitForTimeout(300);
  await page.getByTestId('marker-color-green').click();
  await page.waitForTimeout(300);
  await page.getByTestId('toggle-labels-button').click();
  await page.waitForTimeout(500);

  // Verify user localStorage
  const userPrefs = await page.evaluate((key) => {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }, userPrefsKey);
  expect(userPrefs).not.toBeNull();
  expect(userPrefs.markerStyle).toBe('circle');
  expect(userPrefs.markerColor).toBe('green');
  expect(userPrefs.showLabels).toBe(true);

  // Logout
  await homePage.topBar.openUserMenu();
  await homePage.topBar.userAvatarMenuLogout.click();
  await page.waitForTimeout(1000);
  await homePage.goto();

  // Guest should see defaults
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(500);
  await expect(page.getByTestId('marker-style-pin')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('marker-color-red')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('preferences-badge')).toHaveCount(0);

  // Guest sets different preference
  await page.getByTestId('marker-color-purple').click();
  await page.waitForTimeout(500);

  // Verify guest key
  const guestPrefs = await page.evaluate(() => {
    const val = localStorage.getItem('deld-map-preferences-guest');
    return val ? JSON.parse(val) : null;
  });
  expect(guestPrefs).not.toBeNull();
  expect(guestPrefs.markerColor).toBe('purple');

  // User key unchanged
  const userPrefsAfter = await page.evaluate((key) => {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }, userPrefsKey);
  expect(userPrefsAfter.markerColor).toBe('green');

  // Close panel before re-login
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(300);

  // Re-login
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(2000);
  await homePage.goto();

  // Verify user prefs restored
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(500);
  await expect(page.getByTestId('marker-style-circle')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('marker-color-green')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('preferences-badge')).toHaveText('3');
});