import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Request Photo Button State Change', () => {
  test('should change button to disabled Requested state after clicking', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // Clear localStorage before test
    await page.evaluate(() => localStorage.removeItem('photo-requests'));
    
    // Scroll to menu section
    const menuSection = page.locator('[data-testid="menu-section"]').or(page.locator('section').filter({ hasText: 'Menu' }).first());
    if (await menuSection.count() > 0) {
      await menuSection.scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(1000);
    
    // Get the first request photo button
    const requestPhotoButtons = page.locator('[data-testid^="request-photo-btn-"]');
    const firstButton = requestPhotoButtons.first();
    await expect(firstButton).toBeVisible();
    
    // Verify initial state shows "Request Photo"
    await expect(firstButton).toContainText('Request Photo');
    
    // Get the button's testid to find the corresponding requested badge
    const buttonTestId = await firstButton.getAttribute('data-testid');
    const menuItemId = buttonTestId?.replace('request-photo-btn-', '') || '';
    
    // Click the button
    await firstButton.click();
    await page.waitForTimeout(500);
    
    // After clicking, button should show "Requested" and be disabled
    await expect(firstButton).toContainText('Requested');
    await expect(firstButton).toBeDisabled();
    
    // Check for the requested badge element
    const requestedBadge = page.locator(`[data-testid="photo-requested-badge-${menuItemId}"]`);
    await expect(requestedBadge).toBeVisible();
  });
});