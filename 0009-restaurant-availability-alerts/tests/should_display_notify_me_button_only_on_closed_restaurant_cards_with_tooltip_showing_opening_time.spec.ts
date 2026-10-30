import { test, expect } from '@playwright/test';

test.describe('Notify Me button visibility on closed restaurants', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
  });

  test('should display Notify Me button only on closed restaurant cards with tooltip showing opening time', async ({ page }) => {
    await page.waitForSelector('[data-testid^="restaurant-card-link-"]', { timeout: 10000 });
    await expect(page.locator('[data-testid^="restaurant-card-link-"]').first()).toBeVisible();

    // Find a restaurant card that shows closed status
    const closedBadge = page.locator('[data-testid^="restaurant-card-link-"]').filter({ has: page.locator('text=/Closed/i') }).first();
    const closedCardExists = await closedBadge.count() > 0;

    if (closedCardExists) {
      // Verify Notify Me button appears on closed restaurant
      const notifyMeButton = closedBadge.locator('[data-testid="notify-me-button"]');
      await expect(notifyMeButton).toBeVisible();

      // Hover over button to see tooltip
      await notifyMeButton.hover();
      await page.waitForTimeout(500);

      // Verify tooltip appears with opening time
      const tooltip = page.locator('[data-testid="notify-tooltip"]');
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toContainText(/Opens at \d{1,2}:\d{2} (AM|PM)/i);
    } else {
      // If no closed restaurants, verify open restaurants don't have the button
      const openRestaurantCard = page.locator('[data-testid^="restaurant-card-link-"]').first();
      const notifyButton = openRestaurantCard.locator('[data-testid="notify-me-button"]');
      await expect(notifyButton).not.toBeVisible();
    }
  });
});