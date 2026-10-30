import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('50-entry cap evicts the oldest expense when a 51st is added', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate(() => {
    const expenses = [];
    for (let i = 0; i < 50; i++) {
      const d = new Date(2025, 0, 1 + i);
      expenses.push({
        id: crypto.randomUUID(),
        restaurantId: 'restaurant-' + String(i).padStart(4, '0'),
        restaurantName: i === 0 ? 'Oldest Restaurant' : 'Restaurant ' + (i + 1),
        amount: 10 + i,
        date: d.toISOString().split('T')[0],
        userId: 'user_0001',
        createdAt: new Date(2025, 0, 1 + i, 12, 0, 0).toISOString()
      });
    }
    localStorage.setItem('deld-dining-expenses-user_0001', JSON.stringify(expenses));
  });

  await page.goto('http://localhost:3000/dining-expenses');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.locator('[data-testid^="expense-entry-"]')).toHaveCount(50);

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();
  await page.getByTestId('log-expense-button').click();
  await page.waitForTimeout(500);
  await page.getByTestId('expense-amount-input').fill('25');
  await page.getByTestId('expense-submit-button').click();
  await expect(page.getByText('Expense logged successfully')).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);

  await page.goto('http://localhost:3000/dining-expenses');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.locator('[data-testid^="expense-entry-"]')).toHaveCount(50);

  await expect(page.getByText('Oldest Restaurant')).not.toBeVisible();

  const firstEntry = page.locator('[data-testid^="expense-entry-"]').first();
  await expect(firstEntry).toContainText('$25.00');

  const count = await page.evaluate(() => {
    const raw = localStorage.getItem('deld-dining-expenses-user_0001');
    return raw ? JSON.parse(raw).length : 0;
  });
  expect(count).toBe(50);
});