import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Photo Tagging - Dish tags persist after form validation error', () => {
  let homePage: HomePage;
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    restaurantDetailsPage = new RestaurantDetailsPage(page);

    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();

    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('should preserve dish tags after validation error when submitting incomplete review', async ({ page }) => {
    await restaurantDetailsPage.clickWriteReview();
    await restaurantDetailsPage.expectToBeOnReviewPage(TEST_RESTAURANT_ID);

    await page.waitForTimeout(1000);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      {
        name: 'test-photo-1.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data-1')
      },
      {
        name: 'test-photo-2.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data-2')
      }
    ]);

    await page.waitForTimeout(1000);

    const tagButton0 = page.getByTestId('photo-tag-button-0');
    await tagButton0.click();
    await page.waitForTimeout(500);
    const dishSelector0 = page.getByTestId('photo-dish-selector-0');
    const option0 = dishSelector0.locator('option, [role="option"]').first();
    await option0.click();
    await page.waitForTimeout(500);

    const tagButton1 = page.getByTestId('photo-tag-button-1');
    await tagButton1.click();
    await page.waitForTimeout(500);
    const dishSelector1 = page.getByTestId('photo-dish-selector-1');
    const option1 = dishSelector1.locator('option, [role="option"]').first();
    await option1.click();
    await page.waitForTimeout(500);

    const dishTag0 = page.getByTestId('photo-dish-tag-0');
    const dishTag1 = page.getByTestId('photo-dish-tag-1');
    await expect(dishTag0).toBeVisible();
    await expect(dishTag1).toBeVisible();

    await restaurantDetailsPage.selectRating(5);
    await restaurantDetailsPage.submitReview();
    await page.waitForTimeout(1000);

    const validationError = page.getByText(/Review text is required|Reviews need to be at least 85 characters/i);
    await expect(validationError).toBeVisible();

    await expect(dishTag0).toBeVisible();
    await expect(dishTag1).toBeVisible();
  });
});