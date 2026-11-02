import { test, expect } from '@playwright/test';

test.describe('Cuisine Preference Quick Filters - URL filter state syncs with chip selection', () => {
  test('should sync chip selection state with URL filter on page load', async ({ page }) => {
    // Given localStorage "deld-cuisine-prefs" contains ["italian", "japanese", "mexican"]
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      localStorage.setItem('deld-cuisine-prefs', JSON.stringify(['italian', 'japanese', 'mexican']));
    });
    
    // When I navigate directly to "/?categories=japanese"
    await page.goto('http://localhost:3000/?categories=japanese');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // Then the chip with data-testid "cuisine-chip-japanese" should have class "bg-primary" indicating active state
    const japaneseChip = page.getByTestId('cuisine-chip-japanese');
    await expect(japaneseChip).toBeVisible();
    await expect(japaneseChip).toHaveAttribute('aria-pressed', 'true');
    
    // And the chip with data-testid "cuisine-chip-italian" should have class "bg-secondary" indicating inactive state
    const italianChip = page.getByTestId('cuisine-chip-italian');
    await expect(italianChip).toBeVisible();
    await expect(italianChip).toHaveAttribute('aria-pressed', 'false');
    
    // And the chip with data-testid "cuisine-chip-mexican" should have class "bg-secondary" indicating inactive state
    const mexicanChip = page.getByTestId('cuisine-chip-mexican');
    await expect(mexicanChip).toBeVisible();
    await expect(mexicanChip).toHaveAttribute('aria-pressed', 'false');
  });
});