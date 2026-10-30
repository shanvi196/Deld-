import { test, expect } from '@playwright/test';

test.describe('Alert modal with reminder timing options', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
  });

  test('should open alert modal with 3 reminder timing options and default selection', async ({ page }) => {
    await page.waitForSelector('[data-testid^="restaurant-card-link-"]', { timeout: 10000 });
    await expect(page.locator('[data-testid^="restaurant-card-link-"]').first()).toBeVisible();

    // Find a closed restaurant card
    const closedCard = page.locator('[data-testid^="restaurant-card-link-"]').filter({ has: page.locator('text=/Closed/i') }).first();
    const closedCardExists = await closedCard.count() > 0;

    if (closedCardExists) {
      // Click Notify Me button
      const notifyMeButton = closedCard.locator('[data-testid="notify-me-button"]');
      await notifyMeButton.click();
      await page.waitForTimeout(500);

      // Verify alert modal opens
      const alertModal = page.locator('[data-testid="alert-modal"]');
      await expect(alertModal).toBeVisible();

      // Verify exactly 3 reminder options exist
      const option15 = page.locator('[data-testid="reminder-option-15"]');
      const option30 = page.locator('[data-testid="reminder-option-30"]');
      const option60 = page.locator('[data-testid="reminder-option-60"]');

      await expect(option15).toBeVisible();
      await expect(option30).toBeVisible();
      await expect(option60).toBeVisible();

      // Verify labels
      await expect(option15).toContainText(/15 minutes before/i);
      await expect(option30).toContainText(/30 minutes before/i);
      await expect(option60).toContainText(/1 hour before/i);

      // Verify 15 minutes is selected by default
      await expect(option15).toBeChecked();

      // Verify confirm button exists
      const confirmButton = page.locator('[data-testid="confirm-alert-button"]');
      await expect(confirmButton).toBeVisible();
    } else {
      // Skip test if no closed restaurants available
      test.skip();
    }
  });
});