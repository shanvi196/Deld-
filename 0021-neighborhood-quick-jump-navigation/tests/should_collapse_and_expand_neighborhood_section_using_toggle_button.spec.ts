import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Neighborhood Quick Jump - Collapse Toggle', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should collapse and expand neighborhood section using toggle button', async ({ page }) => {
    const toggle = page.locator('[data-testid="neighborhood-section-toggle"]');
    await expect(toggle).toBeVisible();

    const items = page.locator('[data-testid^="neighborhood-item-"]');
    await expect(items.first()).toBeVisible();

    await toggle.click();
    await page.waitForTimeout(500);

    await expect(items.first()).toBeHidden();

    await toggle.click();
    await page.waitForTimeout(500);

    await expect(items.first()).toBeVisible();
  });
});