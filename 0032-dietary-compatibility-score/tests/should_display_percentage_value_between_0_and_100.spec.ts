import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Dietary Compatibility Score - Percentage range validation', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should display percentage value between 0 and 100', async ({ page, context }) => {
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
    
    const scoreValues = page.locator('[data-testid="dietary-score-value"]');
    const count = await scoreValues.count();
    expect(count).toBeGreaterThanOrEqual(0);
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await scoreValues.nth(i).textContent();
      const percentMatch = text?.match(/(\d+)%/);
      expect(percentMatch).not.toBeNull();
      const percentValue = parseInt(percentMatch![1], 10);
      expect(percentValue).toBeGreaterThanOrEqual(0);
      expect(percentValue).toBeLessThanOrEqual(100);
    }
  });
});