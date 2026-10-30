import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Switching between guest and logged-in user maintains fully isolated scoped histories', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await page.evaluate(() => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('recentSearches_')) localStorage.removeItem(key);
    });
  });

  await homePage.fillSearchQuery('guest-tacos');
  await homePage.fillSearchLocation('Austin, TX');
  await homePage.clickSearchSubmit();
  await page.waitForTimeout(1000);

  const guestStored = await page.evaluate(() => {
    const data = localStorage.getItem('recentSearches_guest');
    return data ? JSON.parse(data) : [];
  });
  expect(guestStored).toHaveLength(1);
  expect(guestStored[0].query).toBe('guest-tacos');

  await expect(page.getByTestId('recent-search-chip-0')).toContainText('guest-tacos');
  await expect(page.getByTestId('recent-search-chip-0')).toContainText('Austin, TX');

  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(2000);

  await homePage.goto();

  await expect(page.getByTestId('recent-searches-section')).not.toBeVisible();

  await homePage.fillSearchQuery('user-sushi');
  await homePage.fillSearchLocation('Seattle, WA');
  await homePage.clickSearchSubmit();
  await page.waitForTimeout(1000);

  const userKeys = await page.evaluate(() => {
    return Object.keys(localStorage).filter(k => k.startsWith('recentSearches_') && k !== 'recentSearches_guest');
  });
  expect(userKeys).toHaveLength(1);

  const userStored = await page.evaluate((key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }, userKeys[0]);
  expect(userStored).toHaveLength(1);
  expect(userStored[0].query).toBe('user-sushi');

  const guestAfterLogin = await page.evaluate(() => {
    const data = localStorage.getItem('recentSearches_guest');
    return data ? JSON.parse(data) : [];
  });
  expect(guestAfterLogin).toHaveLength(1);
  expect(guestAfterLogin[0].query).toBe('guest-tacos');

  await homePage.topBar.openUserMenu();
  await homePage.topBar.userAvatarMenuLogout.click();
  await page.waitForTimeout(1000);

  await homePage.goto();

  await expect(page.getByTestId('recent-search-chip-0')).toContainText('guest-tacos');
  await expect(page.getByTestId('recent-search-chip-0')).toContainText('Austin, TX');

  const allKeys = await page.evaluate(() => {
    return Object.keys(localStorage).filter(k => k.startsWith('recentSearches_'));
  });
  expect(allKeys.length).toBeGreaterThanOrEqual(2);
});