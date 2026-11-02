import { test, expect } from '@playwright/test';

test.describe('Recently Viewed - Save restaurant to sessionStorage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      sessionStorage.removeItem('deld-recent-views');
    });
  });

  test('should save restaurant to sessionStorage when viewing details page', async ({ page }) => {
    await page.goto('http://localhost:3000/restaurants/dc553a2b-ac48-4126-964b-bd95e45e5670');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const recentViews = await page.evaluate(() => {
      const data = sessionStorage.getItem('deld-recent-views');
      return data ? JSON.parse(data) : [];
    });

    expect(recentViews.length).toBe(1);
    expect(recentViews[0].restaurantId).toBe('dc553a2b-ac48-4126-964b-bd95e45e5670');
    expect(recentViews[0]).toHaveProperty('name');
    expect(recentViews[0]).toHaveProperty('cuisine');
    expect(recentViews[0]).toHaveProperty('timestamp');
  });
});