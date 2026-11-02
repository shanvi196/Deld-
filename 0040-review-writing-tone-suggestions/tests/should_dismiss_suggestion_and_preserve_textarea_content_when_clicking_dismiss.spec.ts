import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Tone Suggestion Popover - Dismiss Suggestion', () => {
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

  test('should dismiss suggestion and preserve textarea content when clicking Dismiss', async ({ page }) => {
    await page.goto(`http://localhost:3000/addreview/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const reviewTextarea = page.getByTestId('review-textarea');
    const negativeText = 'worst ever experience';
    await reviewTextarea.fill(negativeText);
    await page.waitForTimeout(500);

    const toneSuggestionPopover = page.getByTestId('tone-suggestion-popover');
    await expect(toneSuggestionPopover).toBeVisible();

    const dismissButton = page.getByTestId('dismiss-suggestion-button');
    await expect(dismissButton).toBeVisible();
    await dismissButton.click();
    await page.waitForTimeout(500);

    await expect(toneSuggestionPopover).not.toBeVisible();

    await expect(reviewTextarea).toHaveValue(negativeText);

    const isFocused = await reviewTextarea.evaluate((el) => document.activeElement === el);
    expect(isFocused).toBe(false);
  });
});