import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('should show disabled Reported state and prevent duplicate report submissions', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await homePage.goto();
  await homePage.expectRestaurantCardsToBeVisible();

  const restaurantId = await homePage.getRestaurantIdFromCard(0);

  await page.evaluate((restId) => {
    localStorage.setItem('deld:reported-restaurants:user_0001', JSON.stringify([restId]));
  }, restaurantId);

  await homePage.getRestaurantCardByIndex(0).hover();
  await page.waitForTimeout(500);

  await page.getByTestId('quick-actions-trigger-' + restaurantId).click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId('quick-action-report-' + restaurantId)).toContainText('Reported');
  await expect(page.getByTestId('quick-action-report-' + restaurantId)).toHaveAttribute('aria-disabled', 'true');

  await page.getByTestId('quick-action-report-' + restaurantId).click();
  await page.waitForTimeout(1000);

  await expect(page.getByText('Report submitted')).not.toBeVisible({ timeout: 2000 });

  const stored = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('deld:reported-restaurants:user_0001') || '[]');
  });
  expect(stored.length).toBe(1);
  expect(stored[0]).toBe(restaurantId);
});