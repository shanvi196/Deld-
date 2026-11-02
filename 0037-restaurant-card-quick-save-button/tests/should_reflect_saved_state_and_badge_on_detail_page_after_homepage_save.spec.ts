import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

test.describe('Cross-page State - Badge Persistence', () => {
  let homePage: HomePage;
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
    await page.waitForTimeout(1000);
  });

  test('should reflect saved state and badge on detail page after homepage save', async ({ page }) => {
    await homePage.expectRestaurantCardsToBeVisible();

    const savedIds: string[] = [];
    for (let i = 0; i < 2; i++) {
      const card = page.locator('[data-testid^="restaurant-card-link-"]').nth(i);
      const cardTestId = await card.getAttribute('data-testid');
      const restaurantId = cardTestId?.replace('restaurant-card-link-', '') ?? '';
      savedIds.push(restaurantId);

      await card.hover();
      await page.waitForTimeout(500);
      const quickSaveBtn = page.getByTestId(`quick-save-button-${restaurantId}`);
      await quickSaveBtn.click();
      await page.waitForTimeout(500);

      const saveDialog = page.getByTestId('save-to-collection-dialog');
      await expect(saveDialog).toBeVisible();
      const checkboxes = saveDialog.locator('[role="checkbox"], input[type="checkbox"]');
      await checkboxes.first().click();
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    await expect(page.getByTestId('saved-count-badge')).toHaveText('2');

    const thirdCard = page.locator('[data-testid^="restaurant-card-link-"]').nth(2);
    const thirdCardTestId = await thirdCard.getAttribute('data-testid');
    const thirdId = thirdCardTestId?.replace('restaurant-card-link-', '') ?? '';

    await thirdCard.hover();
    await page.waitForTimeout(500);
    const thirdBtn = page.getByTestId(`quick-save-button-${thirdId}`);
    await thirdBtn.click();
    await page.waitForTimeout(500);

    const saveDialog = page.getByTestId('save-to-collection-dialog');
    await expect(saveDialog).toBeVisible();
    const checkboxes = saveDialog.locator('[role="checkbox"], input[type="checkbox"]');
    await checkboxes.first().click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    await expect(page.getByTestId('saved-count-badge')).toHaveText('3');

    await restaurantDetailsPage.goto(thirdId);
    await restaurantDetailsPage.waitForPageLoad();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('saved-count-badge')).toHaveText('3');

    await restaurantDetailsPage.expectSaveButtonToShow('Saved');
  });
});