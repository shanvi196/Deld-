import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';

test('Log expense from restaurant detail page', async ({ page }) => {
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

  const logExpenseButton = page.getByTestId('log-expense-button');
  await expect(logExpenseButton).toBeVisible();
  await logExpenseButton.click();

  const expenseAmountInput = page.getByTestId('expense-amount-input');
  await expect(expenseAmountInput).toBeVisible();

  const expenseDateInput = page.getByTestId('expense-date-input');
  await expect(expenseDateInput).toBeVisible();

  const expenseSubmitButton = page.getByTestId('expense-submit-button');
  await expect(expenseSubmitButton).toBeVisible();
});
