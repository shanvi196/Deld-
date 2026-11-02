import { test, expect } from '@playwright/test';

test.describe('Recently Viewed - No duplicates, update timestamp', () => {
  test('should not duplicate restaurants - update timestamp instead', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const initialData = [{
        restaurantId: 'dc553a2b-ac48-4126-964b-bd95e45e5670',
        name: 'Test Restaurant',
        cuisine: 'Italian',
        timestamp: 1700000000000
      }];
      sessionStorage.setItem('deld-recent-views', JSON.stringify(initialData));
    });

    await page.goto('http://localhost:3000/restaurants/dc553a2b-ac48-4126-964b-bd95e45e5670');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const recentViews = await page.evaluate(() => {
      const data = sessionStorage.getItem('deld-recent-views');
      return data ? JSON.parse(data) : [];
    });

    const rest0001Entries = recentViews.filter((v: { restaurantId: string }) => v.restaurantId === 'dc553a2b-ac48-4126-964b-bd95e45e5670');
    expect(rest0001Entries.length).toBe(1);
    expect(recentViews[0].timestamp).toBeGreaterThan(1700000000000);
  });
});