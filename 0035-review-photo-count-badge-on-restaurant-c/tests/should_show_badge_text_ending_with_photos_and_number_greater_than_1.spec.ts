import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Photo Count Badge - Correct Count Format', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should show badge text ending with photos and number greater than 1', async ({ page }) => {
    await homePage.expectRestaurantCardsToBeVisible();

    const photoCountBadges = page.locator('[data-testid="photo-count-badge"]');
    const badgeCount = await photoCountBadges.count();

    expect(badgeCount).toBeGreaterThan(0);

    const firstBadge = photoCountBadges.first();
    const badgeText = await firstBadge.textContent();

    expect(badgeText).toBeTruthy();
    expect(badgeText).toContain(' photos');

    const numberMatch = badgeText!.match(/(\d+)/);
    expect(numberMatch).toBeTruthy();
    const photoNumber = parseInt(numberMatch![1], 10);
    expect(photoNumber).toBeGreaterThan(1);
  });
});