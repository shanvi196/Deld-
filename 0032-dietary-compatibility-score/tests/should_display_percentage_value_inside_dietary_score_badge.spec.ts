import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test.describe('Dietary Compatibility Score - Percentage display', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should display percentage value inside dietary score badge', async ({ page, context }) => {
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
    await homePage.expectRestaurantCardsToBeVisible();

    const scoreValue = page.locator('[data-testid="dietary-score-value"]').first();
    await expect(scoreValue).toBeVisible();

    const text = await scoreValue.textContent();
    expect(text).toMatch(/\d+%/);
  });
});