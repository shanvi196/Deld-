import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Multiple Menu Item Request Counts', () => {
  test('should maintain separate request counts for different menu items', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // Get actual menu item IDs from the page
    const requestPhotoButtons = page.locator('[data-testid^="request-photo-btn-"]');
    const buttonCount = await requestPhotoButtons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(2);
    
    const button1TestId = await requestPhotoButtons.nth(0).getAttribute('data-testid');
    const button2TestId = await requestPhotoButtons.nth(1).getAttribute('data-testid');
    const menuItem1 = button1TestId?.replace('request-photo-btn-', '') || '';
    const menuItem2 = button2TestId?.replace('request-photo-btn-', '') || '';
    
    expect(menuItem1).toBeTruthy();
    expect(menuItem2).toBeTruthy();
    
    // Set up localStorage with requests for two different menu items
    const photoRequests = [
      { restaurantId: TEST_RESTAURANT_ID, menuItemId: menuItem1, timestamp: Date.now() - 2000 },
      { restaurantId: TEST_RESTAURANT_ID, menuItemId: menuItem1, timestamp: Date.now() - 1500 },
      { restaurantId: TEST_RESTAURANT_ID, menuItemId: menuItem2, timestamp: Date.now() - 1000 },
      { restaurantId: TEST_RESTAURANT_ID, menuItemId: menuItem2, timestamp: Date.now() - 900 },
      { restaurantId: TEST_RESTAURANT_ID, menuItemId: menuItem2, timestamp: Date.now() - 800 },
      { restaurantId: TEST_RESTAURANT_ID, menuItemId: menuItem2, timestamp: Date.now() - 700 }
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
    
    // Check count badge for menu item 1 (should show 2)
    const countBadge1 = page.locator(`[data-testid="photo-request-count-${menuItem1}"]`);
    await expect(countBadge1).toBeVisible();
    await expect(countBadge1).toContainText('2');
    
    // Check count badge for menu item 2 (should show 4)
    const countBadge2 = page.locator(`[data-testid="photo-request-count-${menuItem2}"]`);
    await expect(countBadge2).toBeVisible();
    await expect(countBadge2).toContainText('4');
    
    // Both buttons should show "Requested" and be disabled
    const button1 = page.locator(`[data-testid="request-photo-btn-${menuItem1}"]`);
    const button2 = page.locator(`[data-testid="request-photo-btn-${menuItem2}"]`);
    
    await expect(button1).toContainText('Requested');
    await expect(button1).toBeDisabled();
    await expect(button2).toContainText('Requested');
    await expect(button2).toBeDisabled();
  });
});