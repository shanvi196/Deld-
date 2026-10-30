import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('should remove bookmark overlay and revert menu label when unsaving a restaurant from all collections', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await homePage.goto();
  await homePage.expectRestaurantCardsToBeVisible();

  const restaurantId = await homePage.getRestaurantIdFromCard(0);

  await homePage.getRestaurantCardByIndex(0).hover();
  await page.waitForTimeout(500);
  await page.getByTestId('quick-actions-trigger-' + restaurantId).click();
  await page.waitForTimeout(500);

  await page.getByTestId('quick-action-save-' + restaurantId).click();
  await page.waitForTimeout(1000);

  await page.locator('[data-testid="collection-item-name"]').first().click();
  await page.waitForTimeout(1000);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  await expect(page.getByTestId('card-bookmark-' + restaurantId)).toBeVisible();

  await homePage.getRestaurantCardLink(restaurantId).hover();
  await page.waitForTimeout(500);
  await page.getByTestId('quick-actions-trigger-' + restaurantId).click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId('quick-action-unsave-' + restaurantId)).toContainText('Saved');

  await page.getByTestId('quick-action-unsave-' + restaurantId).click();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('card-bookmark-' + restaurantId)).not.toBeVisible();

  await homePage.getRestaurantCardLink(restaurantId).hover();
  await page.waitForTimeout(500);
  await page.getByTestId('quick-actions-trigger-' + restaurantId).click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId('quick-action-save-' + restaurantId)).toContainText('Save to Collection');
});