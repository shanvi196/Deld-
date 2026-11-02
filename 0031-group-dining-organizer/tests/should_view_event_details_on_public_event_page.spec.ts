import { test, expect } from '@playwright/test';

test.describe('Group Dining Planner - View Event Details Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const testEvent = {
        id: 'evt_test123',
        restaurantId: '25047088-5a40-4fab-be5c-3ee9a54fb980',
        name: 'Friday Dinner',
        date: '2025-10-30',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('groupEvents', JSON.stringify([testEvent]));
    });
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('groupEvents');
    });
  });

  test('should view event details on public event page', async ({ page }) => {
    await page.goto('http://localhost:3000/events/evt_test123');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const eventName = page.getByTestId('event-name');
    await expect(eventName).toBeVisible();
    await expect(eventName).toContainText('Friday Dinner');

    const eventDate = page.getByTestId('event-date');
    await expect(eventDate).toBeVisible();
    await expect(eventDate).toContainText('October 30, 2025');

    const eventRestaurantLink = page.getByTestId('event-restaurant-link');
    await expect(eventRestaurantLink).toBeVisible();

    const href = await eventRestaurantLink.getAttribute('href');
    expect(href).toContain('/restaurants/');
    expect(href).toContain('25047088-5a40-4fab-be5c-3ee9a54fb980');
  });
});