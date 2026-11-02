import { test, expect } from '@playwright/test';
import { HomePage } from "./pages/home_page";
import { TEST_USER } from "./fixtures/test_users";
import { RestaurantDetailsPage } from "./pages/restaurant_details_page";

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Expandable Review Text - Short Reviews', () => {
  test('Short review displays without Read more button', async ({ page }) => {

    const homePage = new HomePage(page);
    const restaurantDetailsPage = new RestaurantDetailsPage(page);
  
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
    
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
    const textToEnter = "Amazing restaurant! The food was excellent and the service was outstanding. Highly recommend!Amazing restaurant! The food was excellent and the service was outstanding. Highly recommend!Amazing restaurant! The food was excellent and the service was outstanding. Highly recommend!" +
          "Amazing restaurant! The food was excellent and the service was outstanding. Highly recommend!Amazing restaurant! The food was excellent and the service was outstanding. Highly recommend!Amazing restaurant! The food was excellent and the service was outstanding. Highly recommend!" +
          "Amazing restaurant! The food was excellent and the service was outstanding. Highly recommend!Amazing restaurant! The food was excellent and the service was outstanding. Highly recommend!Amazing restaurant! The food was excellent and the service was outstanding. Highly recommend!"
    if (await restaurantDetailsPage.writeReviewButton.isVisible()) {
    await restaurantDetailsPage.expectWriteReviewButtonToBeVisible();
    await restaurantDetailsPage.clickWriteReview();
    await restaurantDetailsPage.expectToBeOnReviewPage(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.selectRating(5);
      await restaurantDetailsPage.fillReviewText(textToEnter)
    await restaurantDetailsPage.submitReview();
    await restaurantDetailsPage.expectToBeBackOnRestaurantPage(TEST_RESTAURANT_ID);
    } else {
      await restaurantDetailsPage.clickEditReview();
      await restaurantDetailsPage.clearReviewText();
      await restaurantDetailsPage.fillReviewText(textToEnter);
      await restaurantDetailsPage.submitEditedReview();
    }
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const reviewsSection = page.getByTestId('recommended-reviews-section');
    await reviewsSection.waitFor({ state: 'visible' });
    await reviewsSection.scrollIntoViewIfNeeded();

    const reviewCards = page.locator('[data-testid="review-card"]');
    const reviewCount = await reviewCards.count();
    expect(reviewCount).toBeGreaterThan(0);

    let validatedShortReview = false;

    for (let i = 0; i < reviewCount; i++) {
      const reviewCard = reviewCards.nth(i);
      const readMoreButton = reviewCard.getByTestId('review-read-more');

      // ✅ Short review = no Read more button
      if (await readMoreButton.count() === 0) {
        validatedShortReview = true;
        break;
      }
    }

    expect(validatedShortReview).toBe(true);
  });
});
