import { test, expect } from '@playwright/test';

test.describe('Cancel an active alert', () => {
  test.beforeEach(async ({ page }) => {
    // Setup localStorage with 2 test alerts
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const alerts = [
        {
          restaurantId: 'restaurant-aaa',
          restaurantName: 'Restaurant A',
          openTime: new Date(Date.now() + 3600000).toISOString(),
          reminderOffset: 15,
          createdAt: new Date().toISOString()
        },
        {
          restaurantId: 'restaurant-bbb',
          restaurantName: 'Restaurant B',
          openTime: new Date(Date.now() + 7200000).toISOString(),
          reminderOffset: 30,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('deld-opening-alerts', JSON.stringify(alerts));
    });
  });

  test('should remove alert from list and localStorage when cancel button is clicked', async ({ page }) => {
    // Navigate to alerts page
    await page.goto('http://localhost:3000/user/alerts');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    // Verify initial state: 2 alert cards
    const alertCards = page.locator('[data-testid="alert-card"]');
    await expect(alertCards).toHaveCount(2);

    // Find the first alert card (Restaurant A) and its cancel button
    const firstCard = alertCards.first();
    await expect(firstCard).toContainText('Restaurant A');
    const cancelButton = firstCard.locator('[data-testid="cancel-alert-button"]');

    // Click cancel button
    await cancelButton.click();
    await page.waitForTimeout(400);

    // Verify only 1 alert card remains
    await expect(alertCards).toHaveCount(1);

    // Verify remaining card is Restaurant B
    await expect(alertCards.first()).toContainText('Restaurant B');

    // Verify localStorage only has 1 alert
    const alerts = await page.evaluate(() => {
      const stored = localStorage.getItem('deld-opening-alerts');
      return stored ? JSON.parse(stored) : [];
    });

    expect(alerts).toHaveLength(1);
    expect(alerts[0].restaurantName).toBe('Restaurant B');

    // Verify Restaurant A is not in localStorage
    const hasRestaurantA = alerts.some((a: { restaurantName: string }) => a.restaurantName === 'Restaurant A');
    expect(hasRestaurantA).toBe(false);
  });
});