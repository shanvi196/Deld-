import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Empty Search State - Does not appear when restaurants exist', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('empty state does not appear when restaurants exist with no filters', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const emptyState = page.getByTestId('empty-search-state');
    await expect(emptyState).not.toBeVisible();

    const restaurantCards = page.locator('[data-testid^="restaurant-card-link-"]');
    await expect(restaurantCards.first()).toBeVisible();
  });
});