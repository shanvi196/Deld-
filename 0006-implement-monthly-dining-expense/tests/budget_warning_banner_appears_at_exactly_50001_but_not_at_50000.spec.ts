import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Budget warning banner appears at exactly $500.01 but not at $500.00', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  const currentDate = new Date().toISOString().split('T')[0];
  await page.evaluate((date) => {
    const expenses = [{
      id: 'seed-500',
      restaurantId: '25047088-5a40-4fab-be5c-3ee9a54fb980',
      restaurantName: 'Budget Test Restaurant',
      amount: 500.00,
      date: date,
      userId: 'user_0001',
      createdAt: new Date().toISOString()
    }];
    localStorage.setItem('deld-dining-expenses-user_0001', JSON.stringify(expenses));
  }, currentDate);

  await page.goto('http://localhost:3000/dining-expenses');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('budget-warning-banner')).not.toBeVisible();

  await expect(page.getByTestId('monthly-summaries')).toContainText('$500.00');

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();
  await page.getByTestId('log-expense-button').click();
  await page.waitForTimeout(500);
  await page.getByTestId('expense-amount-input').fill('0.01');
  await page.getByTestId('expense-submit-button').click();
  await expect(page.getByText('Expense logged successfully')).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);

  await page.goto('http://localhost:3000/dining-expenses');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('budget-warning-banner')).toBeVisible();
  await expect(page.getByTestId('budget-warning-banner')).toHaveText("You've exceeded your $500 monthly dining budget");

  const smallExpense = page.locator('[data-testid^="expense-entry-"]').filter({ hasText: '$0.01' });
  await smallExpense.locator('[data-testid^="delete-expense-"]').click();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('budget-warning-banner')).not.toBeVisible();

  await expect(page.getByTestId('monthly-summaries')).toContainText('$500.00');
});