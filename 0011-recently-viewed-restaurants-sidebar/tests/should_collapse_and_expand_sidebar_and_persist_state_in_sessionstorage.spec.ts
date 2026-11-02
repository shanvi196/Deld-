import { test, expect } from '@playwright/test';

test.describe('Recently Viewed - Collapse and expand sidebar', () => {
  test('should collapse and expand sidebar and persist state in sessionStorage', async ({ page }) => {
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
      sessionStorage.removeItem('deld-recent-views-collapsed');
    });

    await page.reload();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const sidebar = page.getByTestId('recent-views-sidebar');
    await expect(sidebar).toBeVisible();

    const toggle = page.getByTestId('recent-views-toggle');
    await toggle.click();
    await page.waitForTimeout(500);

    const collapsedState = await page.evaluate(() => sessionStorage.getItem('deld-recent-views-collapsed'));
    expect(collapsedState).toBe('true');

    await page.reload();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const collapsedStateAfterRefresh = await page.evaluate(() => sessionStorage.getItem('deld-recent-views-collapsed'));
    expect(collapsedStateAfterRefresh).toBe('true');

    const toggleAfterRefresh = page.getByTestId('recent-views-toggle');
    await toggleAfterRefresh.click();
    await page.waitForTimeout(500);

    const expandedState = await page.evaluate(() => sessionStorage.getItem('deld-recent-views-collapsed'));
    expect(expandedState).toBe('false');

    const card1 = page.getByTestId('recent-view-card-rest_0001');
    const card2 = page.getByTestId('recent-view-card-rest_0002');
    await expect(card1).toBeVisible();
    await expect(card2).toBeVisible();
  });
});