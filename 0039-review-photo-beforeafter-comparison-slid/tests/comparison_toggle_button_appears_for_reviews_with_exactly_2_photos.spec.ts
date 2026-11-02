import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { HomePage } from "./pages/home_page";
import { TEST_USER } from "./fixtures/test_users";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Comparison Slider Feature', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();

    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('comparison toggle button appears for reviews with exactly 2 photos', async ({ page }) => {
    await page.waitForTimeout(2000);
    if (await restaurantDetailsPage.writeReviewButton.isVisible()){
      restaurantDetailsPage.clickWriteReview();
    }else{
    await restaurantDetailsPage.clickEditReview();
    }
    await page.waitForTimeout(2000);

    await restaurantDetailsPage.selectRating(3);

    await restaurantDetailsPage.fillReviewText("It was okay. Nothing special but not bad either.It was okay. Nothing special but not bad either.It was okay. Nothing special but not bad either.It was okay. Nothing special but not bad either.");

    await page.locator('input[type="file"][accept*="image"]').setInputFiles([
      path.join(__dirname, 'sample2.jpg'),
      path.join(__dirname, 'sample3.jpg')
    ]);

    if (await restaurantDetailsPage.postReviewButton.isVisible()){
      restaurantDetailsPage.submitReview();
    }else{
    await restaurantDetailsPage.submitEditedReview();
    }
    
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);

    const toggleButton = page.locator('[data-testid="comparison-toggle-button"]');
    await expect(toggleButton).toBeVisible();
    await expect(toggleButton).toHaveText('View as Comparison');
    
  });
});
