import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Search Autocomplete Dropdown', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should show autocomplete dropdown when typing matching text', async ({ page }) => {
    const searchInput = page.getByTestId('search-query-input');
    await searchInput.fill('piz');
    await page.waitForTimeout(300);
    const dropdown = page.getByTestId('search-autocomplete-dropdown');
    await expect(dropdown).toBeVisible();
    const firstItem = page.getByTestId('autocomplete-item-0');
    await expect(firstItem).toContainText('Pizza');
  });
});