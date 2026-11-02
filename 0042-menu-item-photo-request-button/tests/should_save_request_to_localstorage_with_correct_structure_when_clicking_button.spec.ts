import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Request Photo localStorage Storage', () => {
  test('should save request to localStorage with correct structure when clicking button', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // Clear localStorage before test
    await page.evaluate(() => localStorage.removeItem('photo-requests'));
    
    // Scroll to menu section and wait
    const menuSection = page.locator('[data-testid="menu-section"]').or(page.locator('section').filter({ hasText: 'Menu' }).first());
    if (await menuSection.count() > 0) {
      await menuSection.scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(1000);
    
    // Click the first request photo button
    const requestPhotoButtons = page.locator('[data-testid^="request-photo-btn-"]');
    const firstButton = requestPhotoButtons.first();
    await expect(firstButton).toBeVisible();
    
    const buttonTestId = await firstButton.getAttribute('data-testid');
    const menuItemId = buttonTestId?.replace('request-photo-btn-', '') || '';
    
    await firstButton.click();
    await page.waitForTimeout(500);
    
    // Check localStorage
    const storedData = await page.evaluate(() => {
      const data = localStorage.getItem('photo-requests');
      return data ? JSON.parse(data) : null;
    });
    
    expect(storedData).not.toBeNull();
    expect(Array.isArray(storedData)).toBe(true);
    expect(storedData.length).toBe(1);
    
    const storedItem = storedData[0];
    expect(storedItem.restaurantId).toBe(TEST_RESTAURANT_ID);
    expect(storedItem.menuItemId).toBeTruthy();
    expect(typeof storedItem.menuItemId).toBe('string');
    expect(typeof storedItem.timestamp).toBe('number');
    
    // Verify timestamp is recent (within last 5 seconds)
    const now = Date.now();
    expect(storedItem.timestamp).toBeGreaterThan(now - 5000);
    expect(storedItem.timestamp).toBeLessThanOrEqual(now);
  });
});