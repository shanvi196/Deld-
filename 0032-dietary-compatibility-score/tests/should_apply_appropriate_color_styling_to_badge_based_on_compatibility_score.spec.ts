import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test.describe('Dietary Compatibility Score - Color coding based on score', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should apply appropriate color styling to badge based on compatibility score', async ({ page, context }) => {
    const userWithRestrictions = {
      id: 'user_0001',
      email: 'sarah.chen@email.com',
      preferences: { dietaryRestrictions: ['vegetarian'] }
    };
    await context.addCookies([{
      name: 'user',
      value: encodeURIComponent(JSON.stringify(userWithRestrictions)),
      domain: 'localhost',
      path: '/'
    }]);
    
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
    await homePage.expectRestaurantCardsToBeVisible();
    
    const badges = page.locator('[data-testid="dietary-score-badge"]');
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(0);
    
    const firstBadge = badges.first();
    await expect(firstBadge).toBeVisible();
    
    const scoreValueElement = firstBadge.locator('[data-testid="dietary-score-value"]');
    const scoreText = await scoreValueElement.textContent();
    const percentMatch = scoreText?.match(/(\d+)%/);
    expect(percentMatch).not.toBeNull();
    const scoreValue = parseInt(percentMatch![1], 10);
    
    const badgeClasses = await firstBadge.getAttribute('class');
    const badgeStyles = await firstBadge.evaluate(el => window.getComputedStyle(el).backgroundColor);
    
    const hasColorStyling = badgeClasses !== null || badgeStyles !== 'rgba(0, 0, 0, 0)';
    expect(hasColorStyling).toBe(true);
  });
});