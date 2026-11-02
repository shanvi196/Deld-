import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_1 = '25047088-5a40-4fab-be5c-3ee9a54fb980';
const TEST_RESTAURANT_2 = 'dc553a2b-ac48-4126-964b-bd95e45e5670';

test.describe('Cross-Restaurant Request Isolation', () => {
  test('should only show requests for current restaurant', async ({ page }) => {
    // Navigate to restaurant 1 first to get an actual menu item ID
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_1}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    const requestPhotoButtons = page.locator('[data-testid^="request-photo-btn-"]');
    await expect(requestPhotoButtons.first()).toBeVisible();
    
    const buttonTestId = await requestPhotoButtons.first().getAttribute('data-testid');
    const menuItemId = buttonTestId?.replace('request-photo-btn-', '') || '';
    expect(menuItemId).toBeTruthy();
    
    // Set up localStorage with requests for two different restaurants
    const photoRequests = [
      { restaurantId: TEST_RESTAURANT_1, menuItemId: menuItemId, timestamp: Date.now() - 1000 },
      { restaurantId: TEST_RESTAURANT_2, menuItemId: menuItemId, timestamp: Date.now() - 2000 },
      { restaurantId: TEST_RESTAURANT_2, menuItemId: menuItemId, timestamp: Date.now() - 3000 },
      { restaurantId: TEST_RESTAURANT_2, menuItemId: menuItemId, timestamp: Date.now() - 4000 },
      { restaurantId: TEST_RESTAURANT_2, menuItemId: menuItemId, timestamp: Date.now() - 5000 },
      { restaurantId: TEST_RESTAURANT_2, menuItemId: menuItemId, timestamp: Date.now() - 6000 }
    ];
    
    // Set localStorage data
    await page.evaluate((requests) => {
      localStorage.setItem('photo-requests', JSON.stringify(requests));
    }, photoRequests);
    
    // Reload to pick up localStorage data
    await page.reload();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // Scroll to menu section
    const menuSection = page.locator('[data-testid="menu-section"]').or(page.locator('section').filter({ hasText: 'Menu' }).first());
    if (await menuSection.count() > 0) {
      await menuSection.scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(1000);
    
    // On restaurant 1, should show count of 1 (only 1 request for this restaurant)
    const countBadgeRest1 = page.locator(`[data-testid="photo-request-count-${menuItemId}"]`);
    await expect(countBadgeRest1).toBeVisible();
    await expect(countBadgeRest1).toContainText('1');
  });
});