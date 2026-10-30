import { test, expect } from '@playwright/test';

test.describe('View active alerts on alerts management page', () => {
  test.beforeEach(async ({ page }) => {
    // Setup localStorage with 2 test alerts
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const alerts = [
        {
          restaurantId: 'restaurant-111',
          restaurantName: 'Pizza Palace',
          openTime: new Date(Date.now() + 3600000).toISOString(),
          reminderOffset: 15,
          createdAt: new Date().toISOString()
        },
        {
          restaurantId: 'restaurant-222',
          restaurantName: 'Burger Barn',
          openTime: new Date(Date.now() + 7200000).toISOString(),
          reminderOffset: 30,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('deld-opening-alerts', JSON.stringify(alerts));
    });
  });

  test('should display alerts page with exactly 2 alert cards showing restaurant names and cancel buttons', async ({ page }) => {
    // Navigate to alerts page
    await page.goto('http://localhost:3000/user/alerts');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    // Verify alerts page is visible
    const alertsPage = page.locator('[data-testid="alerts-page"]');
    await expect(alertsPage).toBeVisible();

    // Verify exactly 2 alert cards
    const alertCards = page.locator('[data-testid="alert-card"]');
    await expect(alertCards).toHaveCount(2);

    // Verify first alert card displays "Pizza Palace"
    const firstCard = alertCards.nth(0);
    await expect(firstCard).toContainText('Pizza Palace');

    // Verify second alert card displays "Burger Barn"
    const secondCard = alertCards.nth(1);
    await expect(secondCard).toContainText('Burger Barn');

    // Verify each card has a cancel button
    const cancelButtons = page.locator('[data-testid="cancel-alert-button"]');
    await expect(cancelButtons).toHaveCount(2);
  });
});