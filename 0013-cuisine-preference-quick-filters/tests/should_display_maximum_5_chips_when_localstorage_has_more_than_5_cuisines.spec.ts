import { test, expect } from '@playwright/test';

test.describe('Cuisine Preference Quick Filters - Maximum 5 chips displayed', () => {
  test('should display maximum 5 chips when localStorage has more than 5 cuisines', async ({ page }) => {
    // Given localStorage "deld-cuisine-prefs" contains 7 cuisines
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      localStorage.setItem('deld-cuisine-prefs', JSON.stringify(['italian', 'japanese', 'mexican', 'chinese', 'thai', 'american', 'french']));
    });
    
    // When I navigate to the home page
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // Then I should see exactly 5 cuisine chips in the quick filters bar
    const chips = page.locator('[data-testid^="cuisine-chip-"]');
    await expect(chips).toHaveCount(5);
    
    // And I should see chip with data-testid "cuisine-chip-italian" as the first chip
    const italianChip = page.getByTestId('cuisine-chip-italian');
    await expect(italianChip).toBeVisible();
    
    // And I should see chip with data-testid "cuisine-chip-thai" as the fifth chip
    const thaiChip = page.getByTestId('cuisine-chip-thai');
    await expect(thaiChip).toBeVisible();
    
    // And I should not see chip with data-testid "cuisine-chip-american"
    const americanChip = page.getByTestId('cuisine-chip-american');
    await expect(americanChip).not.toBeVisible();
    
    // And I should not see chip with data-testid "cuisine-chip-french"
    const frenchChip = page.getByTestId('cuisine-chip-french');
    await expect(frenchChip).not.toBeVisible();
  });
});