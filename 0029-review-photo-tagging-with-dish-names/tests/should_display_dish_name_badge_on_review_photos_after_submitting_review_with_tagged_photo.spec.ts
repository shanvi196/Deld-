import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Photo Tagging - Display dish tag overlay on submitted review', () => {
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

  test('should display dish name badge on review photos after submitting review with tagged photo', async ({ page }) => {
    await restaurantDetailsPage.clickWriteReview();
    await restaurantDetailsPage.expectToBeOnReviewPage(TEST_RESTAURANT_ID);

    await page.waitForTimeout(1000);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-tagged-photo.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data-for-tagged-photo')
    });

    await page.waitForTimeout(1000);

    const tagButton = page.getByTestId('photo-tag-button-0');
    await tagButton.click();
    await page.waitForTimeout(500);

    const dishSelector = page.getByTestId('photo-dish-selector-0');
    const firstOption = dishSelector.locator('option, [role="option"]').first();
    const selectedDishName = await firstOption.textContent();
    await firstOption.click();
    await page.waitForTimeout(500);

    const dishTag = page.getByTestId('photo-dish-tag-0');
    await expect(dishTag).toBeVisible();

    await restaurantDetailsPage.selectRating(5);

    const reviewTextarea = page.getByTestId('review-textarea');
    await reviewTextarea.fill('This is a test review with a tagged photo showing a delicious dish from this restaurant. The food was amazing and I highly recommend trying this menu item.');

    await restaurantDetailsPage.submitReview();
    await page.waitForTimeout(2000);

    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1500);

    const dishBadge = page.getByTestId('review-photo-dish-badge').first();
    await expect(dishBadge).toBeVisible();
    const badgeText = await dishBadge.textContent();
    expect(badgeText).toBeTruthy();
    expect(badgeText!.length).toBeGreaterThan(0);
  });
});