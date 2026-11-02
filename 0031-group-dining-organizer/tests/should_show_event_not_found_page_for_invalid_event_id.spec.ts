import { test, expect } from '@playwright/test';

test.describe('Group Dining Planner - Event Not Found', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      localStorage.setItem('groupEvents', JSON.stringify([]));
    });
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('groupEvents');
    });
  });

  test('should show event not found page for invalid event ID', async ({ page }) => {
    await page.goto('http://localhost:3000/events/nonexistent_evt_999');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const eventNotFound = page.getByTestId('event-not-found');
    await expect(eventNotFound).toBeVisible();
    await expect(eventNotFound).toContainText('Event not found');

    const eventName = page.getByTestId('event-name');
    await expect(eventName).not.toBeVisible();
  });
});