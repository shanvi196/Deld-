import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Character Limit Warning - Warning Disappears', () => {
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

  test('should hide warning when character count drops below 960 by deleting text', async ({ page }) => {
    await page.goto(`http://localhost:3000/addreview/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const reviewTextarea = page.getByTestId('review-textarea');
    await expect(reviewTextarea).toBeVisible();

    const text965 = 'a'.repeat(965);
    await reviewTextarea.fill(text965);
    await page.waitForTimeout(300);

    const characterCountText = page.getByTestId('character-count-text');
    await expect(characterCountText).toHaveText('965/1000');
    await expect(characterCountText).toHaveClass(/text-red-600/);

    let warningElement = page.getByTestId('character-limit-warning');
    await expect(warningElement).toBeVisible();

    const text955 = 'a'.repeat(955);
    await reviewTextarea.fill(text955);
    await page.waitForTimeout(300);

    await expect(characterCountText).toHaveText('955/1000');
    await expect(characterCountText).toHaveClass(/text-yellow-600/);

    warningElement = page.getByTestId('character-limit-warning');
    await expect(warningElement).not.toBeVisible();
  });
});