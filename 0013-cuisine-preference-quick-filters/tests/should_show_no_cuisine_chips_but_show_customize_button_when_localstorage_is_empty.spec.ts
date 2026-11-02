import { test, expect } from '@playwright/test';

test.describe('Cuisine Preference Quick Filters - Empty localStorage shows Customize button', () => {
  test('should show no cuisine chips but show Customize button when localStorage is empty', async ({ page }) => {
    // Given localStorage "deld-cuisine-prefs" is empty or not set
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      localStorage.removeItem('deld-cuisine-prefs');
    });
    
    // When I navigate to the home page
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // Then I should see the container with data-testid "cuisine-quick-filters"
    const quickFiltersContainer = page.getByTestId('cuisine-quick-filters');
    await expect(quickFiltersContainer).toBeVisible();
    
    // And I should see 0 cuisine chips
    const chips = page.locator('[data-testid^="cuisine-chip-"]');
    await expect(chips).toHaveCount(0);
    
    // And I should see button with data-testid "customize-cuisines-btn" with text "Customize"
    const customizeButton = page.getByTestId('customize-cuisines-btn');
    await expect(customizeButton).toBeVisible();
    await expect(customizeButton).toContainText('Customize');
  });
});