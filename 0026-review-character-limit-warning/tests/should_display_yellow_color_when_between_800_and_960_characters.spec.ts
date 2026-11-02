import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Character Limit Warning - Yellow Color', () => {
  let homePage: HomePage;
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test('should display yellow color when between 800 and 960 characters', async ({ page }) => {
    await page.goto(`http://localhost:3000/addreview/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const reviewTextarea = page.getByTestId('review-textarea');
    await expect(reviewTextarea).toBeVisible();

    const text850 = 'a'.repeat(850);
    await reviewTextarea.fill(text850);
    await page.waitForTimeout(300);

    const characterCountText = page.getByTestId('character-count-text');
    await expect(characterCountText).toHaveText('850/1000');
    await expect(characterCountText).toHaveClass(/text-yellow-600/);

    const warningElement = page.getByTestId('character-limit-warning');
    await expect(warningElement).not.toBeVisible();
  });
});