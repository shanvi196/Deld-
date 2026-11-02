import { test, expect } from '@playwright/test';

test.describe('Cuisine Preference Quick Filters - Click chip applies filter', () => {
  test('should apply filter to URL and show active state when clicking cuisine chip', async ({ page }) => {
    // Given localStorage "deld-cuisine-prefs" contains ["italian", "chinese", "thai"]
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      localStorage.setItem('deld-cuisine-prefs', JSON.stringify(['italian', 'chinese', 'thai']));
    });
    
    // And I am on the home page with no filters applied
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // And the URL does not contain "categories="
    expect(page.url()).not.toContain('categories=');
    
    // When I click the chip with data-testid "cuisine-chip-italian"
    const italianChip = page.getByTestId('cuisine-chip-italian');
    await expect(italianChip).toBeVisible();
    await italianChip.click();
    
    // Wait for URL to update
    await page.waitForURL(/categories=italian/, { timeout: 5000 });
    
    // Then the URL should change to contain "categories=italian"
    expect(page.url()).toContain('categories=italian');
    
    // And the chip should be in active (pressed) state
    await expect(italianChip).toHaveAttribute('aria-pressed', 'true');
  });
});