import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_USER_2 = {
  email: 'mike.rodriguez@email.com',
  password: 'password123'
};

test('Switching users shows second user preferences and hides first user data', async ({ page }) => {
  const homePage = new HomePage(page);

  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => {
    localStorage.setItem('deld-cuisine-prefs-user_0001', JSON.stringify({
      cuisines: ['italian', 'thai', 'japanese'],
      updatedAt: '2024-01-15T14:20:00.000Z'
    }));
    localStorage.removeItem('deld-cuisine-prefs-user_0002');
  });

  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('cuisine-quick-filters')).toBeVisible();
  await expect(page.getByTestId('cuisine-chip-italian')).toBeVisible();
  await expect(page.getByTestId('cuisine-chip-thai')).toBeVisible();
  await expect(page.getByTestId('cuisine-chip-japanese')).toBeVisible();

  await homePage.topBar.openUserMenu();
  await homePage.topBar.userAvatarMenuLogout.click();
  await page.waitForTimeout(1000);
  await page.waitForLoadState('networkidle');

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER_2.email, TEST_USER_2.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('cuisine-quick-filters')).toHaveCount(0);
  expect(await page.locator('[data-testid^="cuisine-chip-"]').count()).toBe(0);
  await expect(page.getByTestId('setup-cuisines-btn')).toBeVisible();

  const sarahData = await page.evaluate(() => localStorage.getItem('deld-cuisine-prefs-user_0001'));
  expect(sarahData).toBeTruthy();
  expect(sarahData).toContain('italian');
});