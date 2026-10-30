import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';

test('Clear all expenses removes data and shows empty state', async ({ page }) => {
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

  const clearAllButton = page.getByTestId('clear-all-expenses-button');
  await expect(clearAllButton).toBeVisible();
  await clearAllButton.click();
  await page.waitForTimeout(500);

  const expenseEntries = page.locator('[data-testid^="expense-entry-"]');
  await expect(expenseEntries).toHaveCount(0);

  const localStorageData = await page.evaluate(() => {
    const data = localStorage.getItem('dining-expenses');
    return data ? JSON.parse(data) : [];
  });
  expect(localStorageData.length).toBe(0);

  await expect(page.getByText('No expenses logged yet')).toBeVisible();

  const monthlySummaries = page.getByTestId('monthly-summaries');
  await expect(monthlySummaries).not.toBeVisible();
});
