import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('should persist copied-links across page navigation and show correct badge count on restaurant detail page', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await homePage.goto();
  await homePage.expectRestaurantCardsToBeVisible();

  await page.evaluate(() => {
    localStorage.removeItem('deld:copied-links:user_0001');
  });

  const restaurantIdA = await homePage.getRestaurantIdFromCard(0);
  const restaurantIdB = await homePage.getRestaurantIdFromCard(1);

  await homePage.getRestaurantCardByIndex(0).hover();
  await page.waitForTimeout(500);

  await page.getByTestId('quick-actions-trigger-' + restaurantIdA).click();
  await page.waitForTimeout(500);

  await page.getByTestId('quick-action-copy-' + restaurantIdA).click();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('copied-links-badge')).toBeVisible();
  await expect(page.getByTestId('copied-links-badge')).toHaveText('1');

  const storedBefore = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('deld:copied-links:user_0001') || '[]');
  });
  expect(storedBefore.length).toBe(1);
  expect(storedBefore[0].restaurantId).toBe(restaurantIdA);
  expect(storedBefore[0]).toHaveProperty('restaurantName');
  expect(storedBefore[0]).toHaveProperty('copiedAt');

  await homePage.clickRestaurantCardByIndex(1);
  await page.waitForTimeout(1000);

  expect(page.url()).toContain('/restaurants/' + restaurantIdB);

  await expect(page.getByTestId('copied-links-badge')).toBeVisible();
  await expect(page.getByTestId('copied-links-badge')).toHaveText('1');

  await page.goBack();
  await page.waitForTimeout(1000);

  const storedAfter = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('deld:copied-links:user_0001') || '[]');
  });
  expect(storedAfter.length).toBe(1);
  expect(storedAfter[0].restaurantId).toBe(restaurantIdA);

  await expect(page.getByTestId('copied-links-badge')).toBeVisible();
  await expect(page.getByTestId('copied-links-badge')).toHaveText('1');
});