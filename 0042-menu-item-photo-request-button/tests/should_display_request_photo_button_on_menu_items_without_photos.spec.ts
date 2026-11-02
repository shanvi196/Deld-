import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Request Photo Button Visibility', () => {
  test('should display Request Photo button on menu items without photos', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // Scroll to menu section
    const menuSection = page.locator('[data-testid="menu-section"]').or(page.locator('section').filter({ hasText: 'Menu' }).first());
    if (await menuSection.count() > 0) {
      await menuSection.scrollIntoViewIfNeeded();
    }
    await page.waitForTimeout(1000);
    
    // Find request photo buttons
    const requestPhotoButtons = page.locator('[data-testid^="request-photo-btn-"]');
    const buttonCount = await requestPhotoButtons.count();
    
    // Should have at least one request photo button visible
    expect(buttonCount).toBeGreaterThan(0);
    
    // First button should display "Request Photo" text
    const firstButton = requestPhotoButtons.first();
    await expect(firstButton).toBeVisible();
    await expect(firstButton).toContainText('Request Photo');
  });
});