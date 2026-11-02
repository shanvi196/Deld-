import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Neighborhood Quick Jump - Apply Filter', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should apply location filter and update URL when clicking neighborhood', async ({ page }) => {
    const firstNeighborhood = page.locator('[data-testid^="neighborhood-item-"]').first();
    await expect(firstNeighborhood).toBeVisible();

    const neighborhoodText = await firstNeighborhood.textContent();
    const neighborhoodName = neighborhoodText?.replace(/\s*\(\d+\)/, '').trim();

    await firstNeighborhood.click();
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('location=');

    const restaurantCards = page.locator('[data-testid^="restaurant-card-link-"]');
    await expect(restaurantCards.first()).toBeVisible();
  });
});