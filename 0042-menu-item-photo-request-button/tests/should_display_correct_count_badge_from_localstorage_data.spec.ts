import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Request Count Badge Display', () => {
  test('should display correct count badge from localStorage data', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // First, find an actual menu item ID from the page
    const requestPhotoButtons = page.locator('[data-testid^="request-photo-btn-"]');
    await expect(requestPhotoButtons.first()).toBeVisible();
    
    const buttonTestId = await requestPhotoButtons.first().getAttribute('data-testid');
    const actualMenuItemId = buttonTestId?.replace('request-photo-btn-', '') || '';
    expect(actualMenuItemId).toBeTruthy();
    
    // Set up localStorage with 3 requests for this menu item
    const photoRequests = [
      { restaurantId: TEST_RESTAURANT_ID, menuItemId: actualMenuItemId, timestamp: Date.now() - 3000 },
      { restaurantId: TEST_RESTAURANT_ID, menuItemId: actualMenuItemId, timestamp: Date.now() - 2000 },
      { restaurantId: TEST_RESTAURANT_ID, menuItemId: actualMenuItemId, timestamp: Date.now() - 1000 }
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
    
    // Check for the count badge
    const countBadge = page.locator(`[data-testid="photo-request-count-${actualMenuItemId}"]`);
    await expect(countBadge).toBeVisible();
    await expect(countBadge).toContainText('3');
  });
});