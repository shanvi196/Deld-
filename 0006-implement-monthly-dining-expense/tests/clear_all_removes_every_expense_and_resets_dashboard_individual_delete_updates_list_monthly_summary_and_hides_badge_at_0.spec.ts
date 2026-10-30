import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Clear All removes every expense and resets dashboard; individual delete updates list, monthly summary, and hides badge at $0', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  const currentDate = new Date().toISOString().split('T')[0];
  await page.evaluate((date) => {
    const expenses = [
      { id: 'exp-200', restaurantId: 'rest-a', restaurantName: 'Restaurant A', amount: 200.00, date: date, userId: 'user_0001', createdAt: new Date(Date.now() - 3000).toISOString() },
      { id: 'exp-150', restaurantId: 'rest-b', restaurantName: 'Restaurant B', amount: 150.00, date: date, userId: 'user_0001', createdAt: new Date(Date.now() - 2000).toISOString() },
      { id: 'exp-50', restaurantId: 'rest-c', restaurantName: 'Restaurant C', amount: 50.00, date: date, userId: 'user_0001', createdAt: new Date(Date.now() - 1000).toISOString() }
    ];
    localStorage.setItem('deld-dining-expenses-user_0001', JSON.stringify(expenses));
  }, currentDate);

  await page.goto('http://localhost:3000/dining-expenses');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.locator('[data-testid^="expense-entry-"]')).toHaveCount(3);
  await expect(page.getByTestId('monthly-summaries')).toContainText('$400.00');
  await expect(page.getByTestId('clear-all-expenses-button')).toBeEnabled();

  await page.getByTestId('clear-all-expenses-button').click();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('expenses-empty-state')).toBeVisible();
  await expect(page.getByTestId('expenses-empty-state')).toContainText('No expenses logged yet');
  await expect(page.getByTestId('clear-all-expenses-button')).toBeDisabled();

  const summariesText = await page.getByTestId('monthly-summaries').textContent();
  expect(summariesText).not.toMatch(/\$\d/);

  const storedRaw = await page.evaluate(() => localStorage.getItem('deld-dining-expenses-user_0001'));
  const parsed = storedRaw ? JSON.parse(storedRaw) : [];
  expect(parsed).toHaveLength(0);

  await homePage.topBar.openUserMenu();
  await expect(page.getByTestId('expenses-current-month-badge')).not.toBeVisible();

  await page.evaluate((date) => {
    const expenses = [
      { id: 'exp-200b', restaurantId: 'rest-a', restaurantName: 'Restaurant A', amount: 200.00, date: date, userId: 'user_0001', createdAt: new Date(Date.now() - 2000).toISOString() },
      { id: 'exp-50b', restaurantId: 'rest-c', restaurantName: 'Restaurant C', amount: 50.00, date: date, userId: 'user_0001', createdAt: new Date(Date.now() - 1000).toISOString() }
    ];
    localStorage.setItem('deld-dining-expenses-user_0001', JSON.stringify(expenses));
  }, currentDate);

  await page.goto('http://localhost:3000/dining-expenses');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const expense200 = page.locator('[data-testid^="expense-entry-"]').filter({ hasText: '$200.00' });
  await expense200.locator('[data-testid^="delete-expense-"]').click();
  await page.waitForTimeout(500);

  await expect(page.getByText('Expense deleted')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('[data-testid^="expense-entry-"]')).toHaveCount(1);
  await expect(page.getByTestId('monthly-summaries')).toContainText('$50.00');

  const expense50 = page.locator('[data-testid^="expense-entry-"]').filter({ hasText: '$50.00' });
  await expense50.locator('[data-testid^="delete-expense-"]').click();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('expenses-empty-state')).toBeVisible();
  await expect(page.getByTestId('expenses-empty-state')).toContainText('No expenses logged yet');
  await expect(page.getByTestId('clear-all-expenses-button')).toBeDisabled();
});