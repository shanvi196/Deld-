import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test.describe('Alert Status Price Dropped', () => {
  let homePage: HomePage;

  test('should show price dropped status when current price meets target', async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();

    await page.evaluate(() => {
      const alert = {
        restaurantId: 'rest_0001',
        menuItemId: 'menu_item_003',
        menuItemName: 'Caesar Salad',
        targetPrice: 10.00,
        currentPrice: 9.50,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('priceAlerts', JSON.stringify([alert]));
    });

    await page.goto('http://localhost:3000/user/alerts');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const alertCards = page.getByTestId('alert-card');
    const firstCard = alertCards.first();
    await expect(firstCard).toContainText('Caesar Salad');

    const alertStatus = firstCard.getByTestId('alert-status');
    await expect(alertStatus).toContainText('Price dropped!');
  });
});