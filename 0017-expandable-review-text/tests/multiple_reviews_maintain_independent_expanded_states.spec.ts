import { test, expect } from '@playwright/test';
import { HomePage } from "./pages/home_page";
import { TEST_USER } from "./fixtures/test_users";
import { RestaurantDetailsPage } from "./pages/restaurant_details_page";

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Expandable Review Text - Independent States', () => {
  test('Multiple reviews maintain independent expanded states', async ({ page }) => {

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
    await page.waitForTimeout(1000);
    
    const readMoreButtons = page.getByTestId('review-read-more');
    const buttonCount = await readMoreButtons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(1);
    
    if (buttonCount >= 2) {
      const firstReadMore = readMoreButtons.first();
      const secondReadMore = readMoreButtons.nth(1);
      
      await expect(firstReadMore).toBeVisible();
      await expect(secondReadMore).toBeVisible();
      
      const firstReviewCard = firstReadMore.locator('xpath=ancestor::*[@data-testid="review-card"]');
      const secondReviewCard = secondReadMore.locator('xpath=ancestor::*[@data-testid="review-card"]');
      
      await firstReadMore.click();
      await page.waitForTimeout(500);
      
      const firstShowLess = firstReviewCard.getByTestId('review-show-less');
      await expect(firstShowLess).toBeVisible();
      
      const firstReviewText = firstReviewCard.locator('p').first();
      const firstHasLineClamp = await firstReviewText.evaluate((el) => {
        return el.classList.contains('line-clamp-4');
      });
      expect(firstHasLineClamp).toBe(false);
      
      const secondReadMoreStillVisible = secondReviewCard.getByTestId('review-read-more');
      await expect(secondReadMoreStillVisible).toBeVisible();
      
      const secondReviewText = secondReviewCard.locator('[class*="line-clamp"]').first();
      const secondHasLineClamp = await secondReviewText.evaluate((el) => {
        return el.classList.contains('line-clamp-4');
      });
      expect(secondHasLineClamp).toBe(true);
    }
  });
});