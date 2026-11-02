import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Neighborhood Quick Jump - Clear Filter', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should clear location filter when clicking active neighborhood again', async ({ page }) => {
    const firstNeighborhood = page.locator('[data-testid^="neighborhood-item-"]').first();
    await expect(firstNeighborhood).toBeVisible();

    await firstNeighborhood.click();
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('location=');

    await firstNeighborhood.click();
    await page.waitForTimeout(1000);

    expect(page.url()).not.toContain('location=');
  });
});