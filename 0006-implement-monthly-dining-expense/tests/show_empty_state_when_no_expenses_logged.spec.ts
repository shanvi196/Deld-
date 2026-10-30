import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';

test('Show empty state when no expenses logged', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  await page.getByTestId('header-login-button').click();
  await page.getByTestId('login-email-input').fill(TEST_USER.email);
  await page.getByTestId('login-password-input').fill(TEST_USER.password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForTimeout(2000);

  await page.evaluate(() => {
    localStorage.removeItem('dining-expenses');
  });

  await page.goto('http://localhost:3000/dining-expenses');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1000);

  await expect(page.getByText('No expenses logged yet')).toBeVisible();

  const expenseEntries = page.locator('[data-testid^="expense-entry-"]');
  await expect(expenseEntries).toHaveCount(0);

  const monthlySummaries = page.getByTestId('monthly-summaries');
  await expect(monthlySummaries).not.toBeVisible();

  const clearAllButton = page.getByTestId('clear-all-expenses-button');
  await expect(clearAllButton).not.toBeVisible();
});
