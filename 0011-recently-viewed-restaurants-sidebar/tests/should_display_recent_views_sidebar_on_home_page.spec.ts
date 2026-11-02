import { test, expect } from '@playwright/test';

test.describe('Recently Viewed - Display sidebar on home page', () => {
  test('should display recent views sidebar on home page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const mockData = [
        { restaurantId: 'rest_0001', name: 'Test Restaurant 1', cuisine: 'Italian', timestamp: Date.now() },
        { restaurantId: 'rest_0002', name: 'Test Restaurant 2', cuisine: 'Japanese', timestamp: Date.now() - 1000 }
      ];
      sessionStorage.setItem('deld-recent-views', JSON.stringify(mockData));
    });

    await page.reload();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const sidebar = page.getByTestId('recent-views-sidebar');
    await expect(sidebar).toBeVisible();

    const card1 = page.getByTestId('recent-view-card-rest_0001');
    const card2 = page.getByTestId('recent-view-card-rest_0002');
    await expect(card1).toBeVisible();
    await expect(card2).toBeVisible();
  });
});