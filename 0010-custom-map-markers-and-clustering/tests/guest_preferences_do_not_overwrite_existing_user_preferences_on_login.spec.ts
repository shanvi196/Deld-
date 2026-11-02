import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Guest preferences do not overwrite existing user preferences on login', async ({ page }) => {
  const homePage = new HomePage(page);
  const USER_ID = 'user_0001';
  const userPrefsKey = `deld-map-preferences-${USER_ID}`;
  const guestPrefsKey = 'deld-map-preferences-guest';

  // Go to home to be on the domain
  await homePage.goto();

  // Pre-set both guest and user prefs in localStorage
  await page.evaluate(({ gKey, uKey }) => {
    localStorage.setItem(gKey, JSON.stringify({
      markerStyle: 'circle',
      markerColor: 'orange',
      showLabels: true
    }));
    localStorage.setItem(uKey, JSON.stringify({
      markerStyle: 'pin',
      markerColor: 'blue',
      showLabels: false
    }));
  }, { gKey: guestPrefsKey, uKey: userPrefsKey });

  // Login
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(2000);
  await homePage.goto();
  await page.waitForTimeout(1000);

  // Verify user prefs unchanged (blue, pin - not overwritten by guest orange, circle)
  const userPrefs = await page.evaluate((key) => {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  }, userPrefsKey);
  expect(userPrefs.markerColor).toBe('blue');
  expect(userPrefs.markerStyle).toBe('pin');

  // Verify UI shows user saved prefs
  await page.getByTestId('map-control-toggle').click();
  await page.waitForTimeout(500);
  await expect(page.getByTestId('marker-color-blue')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('marker-style-pin')).toHaveAttribute('aria-pressed', 'true');
});