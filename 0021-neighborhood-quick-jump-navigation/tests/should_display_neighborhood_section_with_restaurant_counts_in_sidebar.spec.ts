import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Neighborhood Quick Jump - Section Display', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display neighborhood section with restaurant counts in sidebar', async ({ page }) => {
    const section = page.locator('[data-testid="neighborhood-section"]');
    await expect(section).toBeVisible();

    const items = page.locator('[data-testid^="neighborhood-item-"]');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(3);

    const firstItem = items.first();
    const text = await firstItem.textContent();
    expect(text).toMatch(/\(\d+\)/);
  });
});