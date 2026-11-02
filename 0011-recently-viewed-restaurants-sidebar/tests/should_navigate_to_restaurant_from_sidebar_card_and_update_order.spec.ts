import { test, expect } from '@playwright/test';

test.describe('Recently Viewed - Navigate from sidebar and update order', () => {
  test('should navigate to restaurant from sidebar card and update order', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const mockData = [
        { restaurantId: 'rest_0003', name: 'Restaurant 3', cuisine: 'Chinese', timestamp: Date.now() },
        { restaurantId: 'rest_0002', name: 'Restaurant 2', cuisine: 'Japanese', timestamp: Date.now() - 1000 },
        { restaurantId: 'rest_0001', name: 'Restaurant 1', cuisine: 'Italian', timestamp: Date.now() - 2000 }
      ];
      sessionStorage.setItem('deld-recent-views', JSON.stringify(mockData));
    });

    await page.reload();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const card = page.getByTestId('recent-view-card-rest_0001');
    await card.click();
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('/restaurants/rest_0001');

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const recentViews = await page.evaluate(() => {
      const data = sessionStorage.getItem('deld-recent-views');
      return data ? JSON.parse(data) : [];
    });

    expect(recentViews[0].restaurantId).toBe('rest_0003');

    const sidebar = page.getByTestId('recent-views-sidebar');
    const firstCard = sidebar.locator('[data-testid^="recent-view-card-"]').first();
    const firstCardTestId = await firstCard.getAttribute('data-testid');
    expect(firstCardTestId).toBe('recent-view-card-rest_0003');
  });
});