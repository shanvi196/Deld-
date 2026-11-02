import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Empty Search State - Clicking clear filters resets search', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('clicking clear filters resets search and shows restaurants', async ({ page }) => {
    await page.goto('http://localhost:3000/?price=$&categories=italian');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const emptyStateImage = page.locator("[data-testid='empty-state-image']");
    await expect(emptyStateImage).toBeVisible();

   const clearFiltersButton = page.locator("[data-testid='clear-filters-button']");
  
    await clearFiltersButton.click();

    const pressedPriceFilter = page.locator("[data-testid='price-filter-1']");
    await expect(pressedPriceFilter).toHaveAttribute('aria-pressed', 'false');

    const pressedCategoryFilter = page.locator("[data-testid='category-filter-italian']");
    await expect(pressedCategoryFilter).toHaveAttribute('aria-pressed', 'false');

    await page.waitForTimeout(1000);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    await expect(page).toHaveURL('http://localhost:3000/');

    const restaurantCards = page.locator('[data-testid^="restaurant-card-link-"]');
    await expect(restaurantCards.first()).toBeVisible();
  });
});