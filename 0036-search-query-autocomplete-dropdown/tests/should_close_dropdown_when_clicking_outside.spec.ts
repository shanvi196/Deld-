import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Search Autocomplete Dropdown', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should close dropdown when clicking outside', async ({ page }) => {
    const searchInput = page.getByTestId('search-query-input');
    await searchInput.fill('pizza');
    await page.waitForTimeout(300);
    const dropdown = page.getByTestId('search-autocomplete-dropdown');
    await expect(dropdown).toBeVisible();
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(300);
    await expect(dropdown).not.toBeVisible();
    await expect(searchInput).toHaveValue('pizza');
  });
});