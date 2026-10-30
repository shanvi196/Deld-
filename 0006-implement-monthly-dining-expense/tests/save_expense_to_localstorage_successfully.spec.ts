import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';

test('Save expense to localStorage successfully', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.getByTestId('header-login-button').click();
  await page.getByTestId('login-email-input').fill(TEST_USER.email);
  await page.getByTestId('login-password-input').fill(TEST_USER.password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForTimeout(2000);

  await page.goto('http://localhost:3000/restaurants/rest_0001');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1500);

  await page.getByTestId('log-expense-button').click();
  await page.waitForTimeout(500);

  await page.getByTestId('expense-amount-input').fill('45.50');

  const today = new Date().toISOString().split('T')[0];
  await page.getByTestId('expense-date-input').fill(today);

  await page.getByTestId('expense-submit-button').click();
  await page.waitForTimeout(1000);

  const localStorageData = await page.evaluate(() => {
    const data = localStorage.getItem('dining-expenses');
    return data ? JSON.parse(data) : null;
  });

  expect(localStorageData).toBeTruthy();
  expect(Array.isArray(localStorageData)).toBe(true);

  const latestExpense = localStorageData[localStorageData.length - 1];
  expect(latestExpense.restaurantId).toBe('rest_0001');
  expect(latestExpense.amount).toBe(45.50);
  expect(latestExpense.date).toBe(today);

  await expect(page.getByText('Expense logged successfully')).toBeVisible({ timeout: 5000 });
});
