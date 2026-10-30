import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('should open login dialog when guest user clicks Save to Collection and show save dialog after successful authentication', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.expectRestaurantCardsToBeVisible();

  const restaurantId = await homePage.getRestaurantIdFromCard(0);

  await homePage.getRestaurantCardByIndex(0).hover();
  await page.waitForTimeout(500);

  await page.getByTestId('quick-actions-trigger-' + restaurantId).click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId('quick-actions-menu-' + restaurantId)).toBeVisible();
  await expect(page.getByTestId('quick-action-save-' + restaurantId)).toContainText('Save to Collection');

  await page.getByTestId('quick-action-save-' + restaurantId).click();
  await page.waitForTimeout(1000);

  await homePage.loginComponent.expectDialogToBeVisible();
  await expect(page.getByTestId('card-bookmark-' + restaurantId)).not.toBeVisible();

  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await page.waitForTimeout(2000);

  await homePage.loginComponent.expectDialogToBeHidden();

  await expect(page.locator('[data-testid="collection-item-name"]').first()).toBeVisible({ timeout: 5000 });

  await page.locator('[data-testid="collection-item-name"]').first().click();
  await page.waitForTimeout(1000);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  await expect(page.getByTestId('card-bookmark-' + restaurantId)).toBeVisible();

  await homePage.getRestaurantCardLink(restaurantId).hover();
  await page.waitForTimeout(500);
  await page.getByTestId('quick-actions-trigger-' + restaurantId).click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId('quick-action-unsave-' + restaurantId)).toBeVisible();
  await expect(page.getByTestId('quick-action-unsave-' + restaurantId)).toContainText('Saved');
});