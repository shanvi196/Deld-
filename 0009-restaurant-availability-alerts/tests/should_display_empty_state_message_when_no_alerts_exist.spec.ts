import { test, expect } from '@playwright/test';

test.describe('Empty alerts page shows empty state message', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    // Clear any existing alerts
    await page.evaluate(() => localStorage.removeItem('deld-opening-alerts'));
  });

  test('should display empty state message when no alerts exist', async ({ page }) => {
    // Navigate to alerts page
    await page.goto('http://localhost:3000/user/alerts');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    // Verify alerts page is visible
    const alertsPage = page.locator('[data-testid="alerts-page"]');
    await expect(alertsPage).toBeVisible();

    // Verify no alert cards are present
    const alertCards = page.locator('[data-testid="alert-card"]');
    await expect(alertCards).toHaveCount(0);

    // Verify empty state message is displayed
    const emptyStateMessage = page.locator('[data-testid="no-alerts-message"]');
    await expect(emptyStateMessage).toBeVisible();
    await expect(emptyStateMessage).toContainText('No active alerts');
  });
});