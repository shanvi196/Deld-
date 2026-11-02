import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Photo Count Badge - Positioning', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should position badge with absolute positioning classes in bottom-right', async ({ page }) => {
    await homePage.expectRestaurantCardsToBeVisible();

    const photoCountBadge = page.locator('[data-testid="photo-count-badge"]').first();
    
    await expect(photoCountBadge).toBeVisible();

    const badgeClasses = await photoCountBadge.getAttribute('class');
    expect(badgeClasses).toBeTruthy();
    expect(badgeClasses).toContain('absolute');
    expect(badgeClasses).toContain('bottom-2');
    expect(badgeClasses).toContain('right-2');
  });
});