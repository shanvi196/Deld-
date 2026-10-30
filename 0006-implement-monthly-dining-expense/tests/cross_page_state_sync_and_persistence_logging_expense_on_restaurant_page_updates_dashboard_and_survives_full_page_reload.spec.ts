import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Cross-page state sync and persistence: logging expense on restaurant page updates dashboard and survives full page reload', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await homePage.goto();
  await page.evaluate(() => {
    localStorage.removeItem('deld-dining-expenses-user_0001');
  });
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();

  await page.getByTestId('log-expense-button').click();
  await page.waitForTimeout(500);
  await page.getByTestId('expense-amount-input').fill('127.50');
  await page.getByTestId('expense-submit-button').click();
  await expect(page.getByText('Expense logged successfully')).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1000);

  await page.goto('http://localhost:3000/dining-expenses');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('expenses-page-heading')).toContainText('Dining Expenses');

  await expect(page.locator('[data-testid^="expense-entry-"]')).toHaveCount(1);
  const firstEntry = page.locator('[data-testid^="expense-entry-"]').first();
  await expect(firstEntry).toContainText('$127.50');

  const restaurantLink = firstEntry.locator('a');
  await expect(restaurantLink).toBeVisible();
  const href = await restaurantLink.getAttribute('href');
  expect(href).toContain('/restaurants/');

  await expect(page.getByTestId('monthly-summaries')).toContainText('$127.50');

  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.locator('[data-testid^="expense-entry-"]')).toHaveCount(1);
  await expect(page.locator('[data-testid^="expense-entry-"]').first()).toContainText('$127.50');
  await expect(page.getByTestId('monthly-summaries')).toContainText('$127.50');

  await homePage.topBar.openUserMenu();

  await expect(page.getByTestId('user-avatar-menu-expenses')).toBeVisible();
  await expect(page.getByTestId('user-avatar-menu-expenses')).toContainText('Dining Expenses');

  await expect(page.getByTestId('expenses-current-month-badge')).toBeVisible();
  await expect(page.getByTestId('expenses-current-month-badge')).toContainText('$127.50');
});