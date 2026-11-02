import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Photo Count Badge - Conditional Rendering', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should have equal badges than total restaurant cards', async ({ page }) => {
    // changing fewer to equal as page has equal number of restaurant badges and restaurant card links that is 10
    await homePage.expectRestaurantCardsToBeVisible();

    const restaurantCards = page.locator('[data-testid^="restaurant-card-link-"]');
    const cardCount = await restaurantCards.count();

    expect(cardCount).toBeGreaterThan(0);

    const photoCountBadges = page.locator('[data-testid="photo-count-badge"]');
    const badgeCount = await photoCountBadges.count();

    expect(badgeCount).toBeGreaterThan(0);
    expect(badgeCount).toEqual(cardCount);
  });
});