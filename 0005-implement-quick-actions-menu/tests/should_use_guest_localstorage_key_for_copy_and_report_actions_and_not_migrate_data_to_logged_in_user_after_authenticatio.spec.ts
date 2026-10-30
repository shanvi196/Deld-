import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('should use guest localStorage key for copy and report actions and not migrate data to logged-in user after authentication', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.expectRestaurantCardsToBeVisible();

  const restaurantIdA = await homePage.getRestaurantIdFromCard(0);
  const restaurantIdB = await homePage.getRestaurantIdFromCard(1);

  await homePage.getRestaurantCardByIndex(0).hover();
  await page.waitForTimeout(500);
  await page.getByTestId('quick-actions-trigger-' + restaurantIdA).click();
  await page.waitForTimeout(500);
  await page.getByTestId('quick-action-copy-' + restaurantIdA).click();
  await page.waitForTimeout(1000);
  await expect(page.getByText('Link copied!')).toBeVisible();

  const guestCopied = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('deld:copied-links:guest') || '[]');
  });
  expect(guestCopied.length).toBe(1);
  expect(guestCopied[0].restaurantId).toBe(restaurantIdA);
  expect(typeof guestCopied[0].restaurantName).toBe('string');

  const userCopiedBefore = await page.evaluate(() => {
    return localStorage.getItem('deld:copied-links:user_0001');
  });
  expect(userCopiedBefore).toBeNull();

  await page.locator('body').click({ position: { x: 10, y: 10 } });
  await page.waitForTimeout(1000);

  await homePage.getRestaurantCardByIndex(1).hover();
  await page.waitForTimeout(500);
  await page.getByTestId('quick-actions-trigger-' + restaurantIdB).click();
  await page.waitForTimeout(500);
  await page.getByTestId('quick-action-report-' + restaurantIdB).click();
  await page.waitForTimeout(1000);
  await expect(page.getByText('Report submitted')).toBeVisible();

  const guestReported = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('deld:reported-restaurants:guest') || '[]');
  });
  expect(guestReported.length).toBe(1);
  expect(guestReported[0]).toBe(restaurantIdB);

  await expect(page.getByTestId('copied-links-badge')).not.toBeVisible();

  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(2000);

  const userCopiedCount = await page.evaluate(() => {
    const val = localStorage.getItem('deld:copied-links:user_0001');
    if (!val) return 0;
    return JSON.parse(val).length;
  });
  expect(userCopiedCount).toBe(0);

  const userReportedCount = await page.evaluate(() => {
    const val = localStorage.getItem('deld:reported-restaurants:user_0001');
    if (!val) return 0;
    return JSON.parse(val).length;
  });
  expect(userReportedCount).toBe(0);

  const guestDataPreserved = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('deld:copied-links:guest') || '[]');
  });
  expect(guestDataPreserved.length).toBe(1);
  expect(guestDataPreserved[0].restaurantId).toBe(restaurantIdA);

  await expect(page.getByTestId('copied-links-badge')).not.toBeVisible();

  await homePage.expectRestaurantCardsToBeVisible();

  await homePage.getRestaurantCardLink(restaurantIdB).hover();
  await page.waitForTimeout(500);
  await page.getByTestId('quick-actions-trigger-' + restaurantIdB).click();
  await page.waitForTimeout(500);
  await expect(page.getByTestId('quick-action-report-' + restaurantIdB)).toContainText('Report Issue');
});