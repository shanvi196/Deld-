import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Multi-user isolation: user_0001 expenses are invisible to user_0002, and localStorage stores correct data shape with all required fields', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await homePage.goto();
  await page.evaluate(() => {
    localStorage.removeItem('deld-dining-expenses-user_0001');
    localStorage.removeItem('deld-dining-expenses-user_0002');
  });

  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();

  await page.getByTestId('log-expense-button').click();
  await page.waitForTimeout(500);
  await page.getByTestId('expense-amount-input').fill('75');
  await page.getByTestId('expense-submit-button').click();

  await expect(page.getByText('Expense logged successfully')).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);

  const storedData = await page.evaluate(() => {
    const raw = localStorage.getItem('deld-dining-expenses-user_0001');
    return raw ? JSON.parse(raw) : null;
  });
  expect(storedData).toHaveLength(1);
  const expense = storedData[0];
  expect(typeof expense.id).toBe('string');
  expect(expense.id.length).toBeGreaterThan(0);
  expect(typeof expense.restaurantId).toBe('string');
  expect(expense.restaurantId.length).toBeGreaterThan(0);
  expect(typeof expense.restaurantName).toBe('string');
  expect(expense.restaurantName.length).toBeGreaterThan(0);
  expect(expense.amount).toBe(75);
  const today = new Date().toISOString().split('T')[0];
  expect(expense.date).toBe(today);
  expect(expense.userId).toBe('user_0001');
  expect(expense.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

  await homePage.topBar.openUserMenu();
  await homePage.topBar.userAvatarMenuLogout.click();
  await page.waitForTimeout(1000);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login('morgan.chambers@email.com', 'password123');
  await homePage.loginComponent.expectSuccessMessage();

  await page.goto('http://localhost:3000/dining-expenses');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('expenses-empty-state')).toBeVisible();
  await expect(page.getByTestId('expenses-empty-state')).toHaveText('No expenses logged yet');

  const user1Data = await page.evaluate(() => {
    const raw = localStorage.getItem('deld-dining-expenses-user_0001');
    return raw ? JSON.parse(raw) : null;
  });
  expect(user1Data).toHaveLength(1);
  expect(user1Data[0].amount).toBe(75);

  await homePage.topBar.openUserMenu();
  await expect(page.getByTestId('expenses-current-month-badge')).not.toBeVisible();
});