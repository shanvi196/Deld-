import { test, expect } from '@playwright/test';

test.describe('Save alert to localStorage and update button state', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before test
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => localStorage.removeItem('deld-opening-alerts'));
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
  });

  test('should save alert to localStorage with correct structure and update button text', async ({ page }) => {
    await page.waitForSelector('[data-testid^="restaurant-card-link-"]', { timeout: 10000 });
    await expect(page.locator('[data-testid^="restaurant-card-link-"]').first()).toBeVisible();

    // Find a closed restaurant card
    const closedCard = page.locator('[data-testid^="restaurant-card-link-"]').filter({ has: page.locator('text=/Closed/i') }).first();
    const closedCardExists = await closedCard.count() > 0;

    if (closedCardExists) {
      // Get restaurant ID from the card
      const testId = await closedCard.getAttribute('data-testid');
      const restaurantId = testId?.replace('restaurant-card-link-', '') || '';

      // Click Notify Me button
      const notifyMeButton = closedCard.locator('[data-testid="notify-me-button"]');
      await notifyMeButton.click();
      await page.waitForTimeout(500);

      // Select 30 minutes option
      const option30 = page.locator('[data-testid="reminder-option-30"]');
      await option30.click();

      // Click confirm button
      const confirmButton = page.locator('[data-testid="confirm-alert-button"]');
      await confirmButton.click();

      // Wait for modal to close
      await page.waitForTimeout(600);
      const alertModal = page.locator('[data-testid="alert-modal"]');
      await expect(alertModal).not.toBeVisible();

      // Verify localStorage contains the alert
      const alerts = await page.evaluate(() => {
        const stored = localStorage.getItem('deld-opening-alerts');
        return stored ? JSON.parse(stored) : [];
      });

      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toHaveProperty('restaurantId');
      expect(alerts[0]).toHaveProperty('restaurantName');
      expect(alerts[0]).toHaveProperty('openTime');
      expect(alerts[0]).toHaveProperty('reminderOffset', 30);
      expect(alerts[0]).toHaveProperty('createdAt');

      // Verify createdAt is a recent ISO timestamp (within last 10 seconds)
      const createdAt = new Date(alerts[0].createdAt);
      const now = new Date();
      expect(now.getTime() - createdAt.getTime()).toBeLessThan(10000);

      // Verify button text changed to "Alert Set"
      await expect(notifyMeButton).toContainText(/Alert Set/i);
    } else {
      test.skip();
    }
  });
});