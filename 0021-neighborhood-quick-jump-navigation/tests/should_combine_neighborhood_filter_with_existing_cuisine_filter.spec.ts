import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Neighborhood Quick Jump - Combine Filters', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should combine neighborhood filter with existing cuisine filter', async ({ page }) => {
    await page.goto('http://localhost:3000/?categories=italian');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const initialCards = page.locator('[data-testid^="restaurant-card-link-"]');
    await expect(initialCards.first()).toBeVisible();
    const initialCount = await initialCards.count();

    const firstNeighborhood = page.locator('[data-testid^="neighborhood-item-"]').first();
    await expect(firstNeighborhood).toBeVisible();

    await firstNeighborhood.click();
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('categories=italian');
    expect(page.url()).toContain('location=');

    await firstNeighborhood.click();
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('categories=italian');
    expect(page.url()).not.toContain('location=');
  });
});