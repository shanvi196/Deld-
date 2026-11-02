import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test.describe('Delete Alert from Alerts Page', () => {
  let homePage: HomePage;

  test('should delete alert from alerts page and update localStorage immediately', async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();

    await page.evaluate(() => {
      const alerts = [
        {
          restaurantId: 'rest_0001',
          menuItemId: 'menu_item_001',
          menuItemName: 'Margherita Pizza',
          targetPrice: 8.00,
          currentPrice: 12.99,
          createdAt: new Date().toISOString()
        },
        {
          restaurantId: 'rest_0002',
          menuItemId: 'menu_item_002',
          menuItemName: 'Caesar Salad',
          targetPrice: 6.00,
          currentPrice: 9.99,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('priceAlerts', JSON.stringify(alerts));
    });

    await page.goto('http://localhost:3000/user/alerts');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const alertCards = page.getByTestId('alert-card');
    await expect(alertCards).toHaveCount(2);

    const deleteButton = page.getByTestId('delete-alert-button').first();
    await deleteButton.click();

    await page.waitForTimeout(500);

    const priceAlerts = await page.evaluate(() => JSON.parse(localStorage.getItem('priceAlerts') || '[]'));
    expect(priceAlerts.length).toBe(1);

    await expect(alertCards).toHaveCount(1);
  });
});