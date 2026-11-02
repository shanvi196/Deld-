import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';
const TEST_REVIEW_ID = '8d5b2ef5-a119-4fc3-a4e2-879ca13bfe26';

test.describe('Tone Suggestion Popover - Navigation State', () => {
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

  test('should clear popover state when navigating from add to edit review page', async ({ page }) => {
    await page.goto(`http://localhost:3000/addreview/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const ratingStar3 = await page.locator("[data-testid='rating-star-3']");
await ratingStar3.click();

    const reviewTextarea = page.getByTestId('review-textarea');
    await reviewTextarea.fill('The food was terrible. The food could be improved. The food could be improved. The food could be improved.');
    await page.waitForTimeout(500);

       const toneSuggestionPopover = page.getByTestId('tone-suggestion-popover');
    await expect(toneSuggestionPopover).toBeVisible();

    const applySuggestionButton = page.getByTestId('apply-suggestion-button');
    await expect(applySuggestionButton).toBeVisible();
    await applySuggestionButton.click();
    await page.waitForTimeout(500);

   const postReviewButton = await page.locator("[data-testid='post-review-button']");
   await postReviewButton.click();
    await page.waitForTimeout(1000);


    await page.goto(`http://localhost:3000/editreview/${TEST_REVIEW_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    await expect(toneSuggestionPopover).not.toBeVisible();

    const editReviewTextarea = page.getByTestId('review-textarea');
    await expect(editReviewTextarea).toBeVisible();

    const textareaValue = await editReviewTextarea.inputValue();
    expect(textareaValue.length).toBeGreaterThan(0);
  });
});