import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';

test('View all logged expenses on dashboard', async ({ page }) => {
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
      { id: 'exp_2', restaurantId: 'rest_0002', restaurantName: 'Restaurant Two', amount: 32.00, date: '2025-01-12', userId: userId },
      { id: 'exp_3', restaurantId: 'rest_0003', restaurantName: 'Restaurant Three', amount: 28.75, date: '2025-01-20', userId: userId }
    ];
    localStorage.setItem('dining-expenses', JSON.stringify(expenses));
  }, TEST_USER.email);

  await page.goto('http://localhost:3000/dining-expenses');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1000);

  const expenseEntries = page.locator('[data-testid^="expense-entry-"]');
  await expect(expenseEntries).toHaveCount(3);

  const firstExpense = expenseEntries.nth(0);
  await expect(firstExpense).toContainText('Restaurant Three');
  await expect(firstExpense).toContainText('$28.75');
  await expect(firstExpense).toContainText('Jan 20, 2025');

  const secondExpense = expenseEntries.nth(1);
  await expect(secondExpense).toContainText('Restaurant Two');
  await expect(secondExpense).toContainText('$32.00');
  await expect(secondExpense).toContainText('Jan 12, 2025');

  const thirdExpense = expenseEntries.nth(2);
  await expect(thirdExpense).toContainText('Restaurant One');
  await expect(thirdExpense).toContainText('$45.50');
  await expect(thirdExpense).toContainText('Jan 5, 2025');
});
