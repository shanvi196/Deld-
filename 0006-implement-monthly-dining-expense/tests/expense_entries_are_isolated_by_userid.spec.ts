import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';

const SECOND_USER = {
  email: 'john.doe@email.com',
  password: 'password456'
};

test('Expense entries are isolated by userId', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.getByTestId('header-login-button').click();
  await page.getByTestId('login-email-input').fill(TEST_USER.email);
  await page.getByTestId('login-password-input').fill(TEST_USER.password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForTimeout(2000);

  await page.evaluate((userId) => {
    const expenses = [
      { id: 'exp_1', restaurantId: 'rest_0001', restaurantName: 'Restaurant One', amount: 45.50, date: '2025-01-05', userId: userId },
      { id: 'exp_2', restaurantId: 'rest_0002', restaurantName: 'Restaurant Two', amount: 32.00, date: '2025-01-12', userId: userId }
    ];
    localStorage.setItem('dining-expenses', JSON.stringify(expenses));
  }, TEST_USER.email);

  const userAvatarMenu = page.getByTestId('user-avatar-menu-trigger');
  await userAvatarMenu.click();
  await page.waitForTimeout(500);

  const logoutButton = page.getByTestId('user-avatar-menu-logout');
  await logoutButton.click();
  await page.waitForTimeout(2000);

  await page.getByTestId('header-login-button').click();
  await page.getByTestId('login-email-input').fill(SECOND_USER.email);
  await page.getByTestId('login-password-input').fill(SECOND_USER.password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForTimeout(2000);

  await page.goto('http://localhost:3000/dining-expenses');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1000);

  await expect(page.getByText('No expenses logged yet')).toBeVisible();

  const expenseEntries = page.locator('[data-testid^="expense-entry-"]');
  await expect(expenseEntries).toHaveCount(0);

  const localStorageData = await page.evaluate((sarahEmail) => {
    const data = localStorage.getItem('dining-expenses');
    if (!data) return [];
    const expenses = JSON.parse(data);
    return expenses.filter((exp: any) => exp.userId === sarahEmail);
  }, TEST_USER.email);

  expect(localStorageData.length).toBe(0);
});
