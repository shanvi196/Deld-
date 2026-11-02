import { test, expect } from '@playwright/test';

test.describe('Recently Viewed - Limit to 8 unique restaurants', () => {
  test('should limit recent views to 8 unique restaurants', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      sessionStorage.removeItem('deld-recent-views');
    });

    const restaurantIds = ['dc553a2b-ac48-4126-964b-bd95e45e5670', '930fcd28-57d0-4643-ab78-609721aabec7', '36af1059-de31-412f-bf9d-ddae41d4ad22', '9b3abdb8-e6b1-4ee9-8224-309d23756363', '8fcc8503-2670-415e-8eef-64e443871d61', '5c2de92c-2f5b-4436-88e2-ed4e6e9b2ad0', 'd30b69e9-e475-4e19-9c7e-b5b2e4e0cf77', 'e3ceee31-3a5b-45cb-a6d1-ee407592273c', '2e98bb5a-3154-4ebf-a365-d641e7a7b1f5', 'de358e40-76b0-479a-a9a3-6a21940addb4'];

    for (const id of restaurantIds) {
      await page.goto(`http://localhost:3000/restaurants/${id}`);
      await page.waitForTimeout(500);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);
    }

    const recentViews = await page.evaluate(() => {
      const data = sessionStorage.getItem('deld-recent-views');
      return data ? JSON.parse(data) : [];
    });

    expect(recentViews.length).toBe(8);
    expect(recentViews[0].restaurantId).toBe('de358e40-76b0-479a-a9a3-6a21940addb4');

    const restaurantIdsInStorage = recentViews.map((v: { restaurantId: string }) => v.restaurantId);
    expect(restaurantIdsInStorage).not.toContain('dc553a2b-ac48-4126-964b-bd95e45e5670');
    expect(restaurantIdsInStorage).not.toContain('930fcd28-57d0-4643-ab78-609721aabec7');
  });
});