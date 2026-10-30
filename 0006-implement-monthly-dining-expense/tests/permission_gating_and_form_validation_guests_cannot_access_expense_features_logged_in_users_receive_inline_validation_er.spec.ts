import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Permission gating and form validation: guests cannot access expense features; logged-in users receive inline validation errors for invalid amounts', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();

  await expect(page.getByTestId('log-expense-button')).not.toBeVisible();

  await page.goto('http://localhost:3000/dining-expenses');
  await page.waitForTimeout(1000);

  await expect(page).toHaveURL('http://localhost:3000/');

  await homePage.loginComponent.expectDialogToBeVisible();
  await expect(homePage.loginComponent.emailInput).toBeVisible();
  await expect(homePage.loginComponent.passwordInput).toBeVisible();

  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate(() => {
    localStorage.removeItem('deld-dining-expenses-user_0001');
  });

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();

  await page.getByTestId('log-expense-button').click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId('log-expense-dialog')).toBeVisible();
  await expect(page.getByTestId('expense-amount-input')).toBeVisible();
  await expect(page.getByTestId('expense-date-input')).toBeVisible();
  await expect(page.getByTestId('expense-submit-button')).toBeVisible();

  const today = new Date().toISOString().split('T')[0];
  await expect(page.getByTestId('expense-date-input')).toHaveValue(today);

  await page.getByTestId('expense-amount-input').fill('0');
  await page.getByTestId('expense-submit-button').click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId('expense-amount-error')).toBeVisible();
  await expect(page.getByTestId('expense-amount-error')).toHaveText('Amount must be between $0.01 and $10,000');
  await expect(page.getByTestId('log-expense-dialog')).toBeVisible();

  await page.getByTestId('expense-amount-input').fill('10001');
  await page.getByTestId('expense-submit-button').click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId('expense-amount-error')).toBeVisible();
  await expect(page.getByTestId('expense-amount-error')).toHaveText('Amount must be between $0.01 and $10,000');

  await page.getByTestId('expense-amount-input').fill('25.50');
  await page.getByTestId('expense-submit-button').click();

  await expect(page.getByText('Expense logged successfully')).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId('log-expense-dialog')).not.toBeVisible();
  await page.waitForTimeout(1000);

  await homePage.topBar.openUserMenu();

  await expect(page.getByTestId('user-avatar-menu-expenses')).toBeVisible();
  await expect(page.getByTestId('user-avatar-menu-expenses')).toContainText('Dining Expenses');

  await expect(page.getByTestId('expenses-current-month-badge')).toBeVisible();
  await expect(page.getByTestId('expenses-current-month-badge')).toContainText('$25.50');
});