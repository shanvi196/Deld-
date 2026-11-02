import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Dietary Compatibility Score - Empty restrictions', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should not display dietary score badge when logged in user has empty dietary restrictions array', async ({ page, context }) => {
    const userEmptyRestrictions = {
      id: 'user_0001',
      email: 'sarah.chen@email.com',
      preferences: { dietaryRestrictions: [] }
    };
    await context.addCookies([{
      name: 'user',
      value: encodeURIComponent(JSON.stringify(userEmptyRestrictions)),
      domain: 'localhost',
      path: '/'
    }]);
    
    await homePage.goto();
    await homePage.expectRestaurantCardsToBeVisible();
    
    const badges = page.locator('[data-testid="dietary-score-badge"]');
    await expect(badges).toHaveCount(0);
  });
});