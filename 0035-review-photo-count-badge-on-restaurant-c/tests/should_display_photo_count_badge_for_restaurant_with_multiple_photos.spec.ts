import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Photo Count Badge - Display for Multiple Photos', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display photo count badge for restaurant with multiple photos', async ({ page }) => {
    await homePage.expectRestaurantCardsToBeVisible();

    const photoCountBadges = page.locator('[data-testid="photo-count-badge"]');
    const badgeCount = await photoCountBadges.count();

    expect(badgeCount).toBeGreaterThan(0);

    const firstBadge = photoCountBadges.first();
    await expect(firstBadge).toBeVisible();

    const badgeText = await firstBadge.textContent();
    expect(badgeText).toMatch(/\d+\s+photos/);
  });
});