import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Tone Suggestion Popover - Closes When Negative Text Deleted', () => {
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

  test('should close popover when negative text is deleted and not reappear for positive text', async ({ page }) => {
    await page.goto(`http://localhost:3000/addreview/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const reviewTextarea = page.getByTestId('review-textarea');
    await reviewTextarea.fill('The food was terrible');
    await page.waitForTimeout(500);

    const toneSuggestionPopover = page.getByTestId('tone-suggestion-popover');
    await expect(toneSuggestionPopover).toBeVisible();

    await reviewTextarea.focus();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(500);

    await expect(reviewTextarea).toHaveValue('');
    await expect(toneSuggestionPopover).not.toBeVisible();

    await reviewTextarea.fill('The food was great');
    await page.waitForTimeout(500);

    await expect(toneSuggestionPopover).not.toBeVisible();
  });
});