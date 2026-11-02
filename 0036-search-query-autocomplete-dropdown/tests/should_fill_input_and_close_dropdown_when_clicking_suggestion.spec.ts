import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Search Autocomplete Dropdown', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should fill input and close dropdown when clicking suggestion', async ({ page }) => {
    const searchInput = page.getByTestId('search-query-input');
    await searchInput.fill('burg');
    await page.waitForTimeout(300);
    const dropdown = page.getByTestId('search-autocomplete-dropdown');
    await expect(dropdown).toBeVisible();
    const firstItem = page.getByTestId('autocomplete-item-0');
    await firstItem.click();
    await page.waitForTimeout(300);
    await expect(searchInput).toHaveValue('Burgers');
    await expect(dropdown).not.toBeVisible();
  });
});