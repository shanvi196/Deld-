import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Logged-in user with no saved preferences sees setup link instead of chips bar', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate(() => {
    localStorage.removeItem('deld-cuisine-prefs-user_0001');
  });

  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('cuisine-quick-filters')).toHaveCount(0);
  expect(await page.locator('[data-testid^="cuisine-chip-"]').count()).toBe(0);
  await expect(page.getByTestId('setup-cuisines-btn')).toBeVisible();

  await page.getByTestId('setup-cuisines-btn').click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId('cuisine-prefs-modal')).toBeVisible();
  await expect(page.getByTestId('cuisine-count')).toContainText('0/10');
  await expect(page.getByTestId('add-cuisine-select')).toBeEnabled();
});