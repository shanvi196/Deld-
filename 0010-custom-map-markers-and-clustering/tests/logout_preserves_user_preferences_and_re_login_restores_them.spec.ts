import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Logout preserves user preferences and re-login restores them', async ({ page }) => {
  const homePage = new HomePage(page);
  const USER_ID = 'user_0001';
  const prefsKey = `deld-map-preferences-${USER_ID}`;

  // Login
  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(2000);
  await homePage.goto();

  // Set preferences: circle, green, labels on
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(500);
  await page.getByTestId('marker-style-circle').click();
  await page.waitForTimeout(300);
  await page.getByTestId('marker-color-green').click();
  await page.waitForTimeout(300);
  await page.getByTestId('toggle-labels-button').click();
  await page.waitForTimeout(500);

  // Verify localStorage
  const prefs = await page.evaluate((key) => {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }, prefsKey);
  expect(prefs.markerStyle).toBe('circle');
  expect(prefs.markerColor).toBe('green');
  expect(prefs.showLabels).toBe(true);

  // Logout
  await homePage.topBar.openUserMenu();
  await homePage.topBar.userAvatarMenuLogout.click();
  await page.waitForTimeout(1000);
  await homePage.goto();

  // Verify user prefs still in localStorage after logout
  const prefsAfterLogout = await page.evaluate((key) => {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }, prefsKey);
  expect(prefsAfterLogout.markerColor).toBe('green');

  // Verify defaults shown in UI (guest view)
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(500);
  await expect(page.getByTestId('marker-style-pin')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('marker-color-red')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('preferences-badge')).toHaveCount(0);

  // Close panel before re-login
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(300);

  // Re-login
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(2000);
  await homePage.goto();

  // Verify all prefs restored
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(500);
  await expect(page.getByTestId('marker-style-circle')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('marker-color-green')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('toggle-labels-button')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('preferences-badge')).toHaveText('3');
});