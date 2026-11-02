import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Photo Tagging - Remove a dish tag from a photo', () => {
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

  test('should remove dish tag when clicking on the badge and show tag button again', async ({ page }) => {
    await restaurantDetailsPage.clickWriteReview();
    await restaurantDetailsPage.expectToBeOnReviewPage(TEST_RESTAURANT_ID);

    await page.waitForTimeout(1000);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-photo.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data')
    });

    await page.waitForTimeout(1000);

    const tagButton = page.getByTestId('photo-tag-button-0');
    await tagButton.click();
    await page.waitForTimeout(500);

    const dishSelector = page.getByTestId('photo-dish-selector-0');
    const firstOption = dishSelector.locator('option, [role="option"]').first();
    await firstOption.click();

    await page.waitForTimeout(500);

    const dishTagBadge = page.getByTestId('photo-dish-tag-0');
    await expect(dishTagBadge).toBeVisible();

    await dishTagBadge.click();
    await page.waitForTimeout(500);

    await expect(dishTagBadge).not.toBeVisible();
    await expect(tagButton).toBeVisible();
  });
});