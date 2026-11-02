import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Search Autocomplete Dropdown', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should hide dropdown when input is cleared', async ({ page }) => {
    const searchInput = page.getByTestId('search-query-input');
    await searchInput.fill('sushi');
    await page.waitForTimeout(300);
    const dropdown = page.getByTestId('search-autocomplete-dropdown');
    await expect(dropdown).toBeVisible();
    await searchInput.fill('');
    await page.waitForTimeout(300);
    await expect(dropdown).not.toBeVisible();
  });
});