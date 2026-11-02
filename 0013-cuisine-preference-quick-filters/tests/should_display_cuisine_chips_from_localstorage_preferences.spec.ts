import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Cuisine Preference Quick Filters - Display chips from localStorage', () => {
  let homePage: HomePage;

  test('should display cuisine chips from localStorage preferences', async ({ page }) => {
    // Given localStorage "deld-cuisine-prefs" contains ["italian", "japanese", "mexican"]
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      localStorage.setItem('deld-cuisine-prefs', JSON.stringify(['italian', 'japanese', 'mexican']));
    });
    
    // When I navigate to the home page
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    
    // Then I should see a container with data-testid "cuisine-quick-filters"
    const quickFiltersContainer = page.getByTestId('cuisine-quick-filters');
    await expect(quickFiltersContainer).toBeVisible();
    
    // And I should see exactly 3 cuisine chips
    const chips = page.locator('[data-testid^="cuisine-chip-"]');
    await expect(chips).toHaveCount(3);
    
    // And I should see chip with data-testid "cuisine-chip-italian" showing "Italian"
    const italianChip = page.getByTestId('cuisine-chip-italian');
    await expect(italianChip).toBeVisible();
    await expect(italianChip).toContainText('Italian');
    
    // And I should see chip with data-testid "cuisine-chip-japanese" showing "Japanese"
    const japaneseChip = page.getByTestId('cuisine-chip-japanese');
    await expect(japaneseChip).toBeVisible();
    await expect(japaneseChip).toContainText('Japanese');
    
    // And I should see chip with data-testid "cuisine-chip-mexican" showing "Mexican"
    const mexicanChip = page.getByTestId('cuisine-chip-mexican');
    await expect(mexicanChip).toBeVisible();
    await expect(mexicanChip).toContainText('Mexican');
  });
});