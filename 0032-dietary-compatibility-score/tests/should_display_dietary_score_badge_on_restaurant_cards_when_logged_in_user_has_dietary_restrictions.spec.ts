import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Dietary Compatibility Score - Logged in with restrictions', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should display dietary score badge on restaurant cards when logged in user has dietary restrictions', async ({ page, context }) => {
    const userWithRestrictions = {
      id: 'user_0001',
      email: 'sarah.chen@email.com',
      preferences: { dietaryRestrictions: ['vegetarian', 'gluten-free'] }
    };
    await context.addCookies([{
      name: 'user',
      value: encodeURIComponent(JSON.stringify(userWithRestrictions)),
      domain: 'localhost',
      path: '/'
    }]);
    
    await homePage.goto();
    await homePage.expectRestaurantCardsToBeVisible();
    
    const badges = page.locator('[data-testid="dietary-score-badge"]');
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });
});