import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Empty Search State - Clear filters button visibility', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('clear filters button is visible and labeled correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/?categories=Icelandic&price=%24%24%24%24');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

const priceFilter = page.locator("[data-testid='price-filter-1']");
await priceFilter.click();
 await page.waitForTimeout(1000);
    const categoryFilter = page.locator("[data-testid='category-filter-italian']");
    await categoryFilter.click();
    await page.waitForTimeout(1000);

    const emptyStateImage = page.locator("[data-testid='empty-state-image']");
    await expect(emptyStateImage).toBeVisible();

    const emptyStateHeading = page.locator("[data-testid='empty-state-heading']");
    await expect(emptyStateHeading).toBeVisible();

    const emptyStateSubText = page.locator("[data-testid='empty-state-subtext']");
    await expect(emptyStateSubText).toBeVisible();

    const clearFiltersButton = page.locator("[data-testid='clear-filters-button']");
    await expect(clearFiltersButton).toBeVisible();

      await expect(clearFiltersButton).toContainText('Clear filters');
      await expect(clearFiltersButton).toBeEnabled();
    
  });
});