import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test.describe('View Alerts Page', () => {
  let homePage: HomePage;

  test('should display alerts on user alerts page with status indicator', async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();

    await page.evaluate(() => {
      const alert = {
        restaurantId: 'rest_0001',
        menuItemId: 'menu_item_001',
        menuItemName: 'Margherita Pizza',
        targetPrice: 8.00,
        currentPrice: 12.99,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('priceAlerts', JSON.stringify([alert]));
    });

    await page.goto('http://localhost:3000/user/alerts');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const alertsList = page.getByTestId('alerts-list');
    await expect(alertsList).toBeVisible();

    const alertCards = page.getByTestId('alert-card');
    await expect(alertCards).toHaveCount(1);

    const firstCard = alertCards.first();
    await expect(firstCard).toContainText('Margherita Pizza');

    await expect(firstCard).toContainText('$12.99');

    await expect(firstCard).toContainText('$8.00');

    const alertStatus = firstCard.getByTestId('alert-status');
    await expect(alertStatus).toContainText('Watching');
  });
});