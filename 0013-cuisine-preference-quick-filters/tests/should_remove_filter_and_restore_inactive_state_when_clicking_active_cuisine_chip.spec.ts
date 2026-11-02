import { test, expect } from '@playwright/test';

test.describe('Cuisine Preference Quick Filters - Click active chip removes filter', () => {
  test('should remove filter and restore inactive state when clicking active cuisine chip', async ({ page }) => {
    // Given localStorage "deld-cuisine-prefs" contains ["italian", "japanese"]
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      localStorage.setItem('deld-cuisine-prefs', JSON.stringify(['italian', 'japanese']));
    });
    
    // And I am on the home page with Italian filter active
    await page.goto('http://localhost:3000/?categories=italian');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // And the chip with data-testid "cuisine-chip-italian" is active
    const italianChip = page.getByTestId('cuisine-chip-italian');
    await expect(italianChip).toBeVisible();
    await expect(italianChip).toHaveAttribute('aria-pressed', 'true');
    
    // When I click the chip with data-testid "cuisine-chip-italian"
    await italianChip.click();
    
    // Wait for URL to update (filter removed)
    await page.waitForURL((url) => !url.toString().includes('categories='), { timeout: 5000 });
    
    // Then the URL should change to "/" without "categories=" parameter
    expect(page.url()).not.toContain('categories=');
    
    // And the chip should be inactive again
    await expect(italianChip).toHaveAttribute('aria-pressed', 'false');
  });
});