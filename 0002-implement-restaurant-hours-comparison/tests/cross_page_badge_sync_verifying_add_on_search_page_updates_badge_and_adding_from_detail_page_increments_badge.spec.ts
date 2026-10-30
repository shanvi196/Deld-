import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

test('Cross-page badge sync verifying add on search page updates badge and adding from detail page increments badge', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);
  await homePage.goto();

  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(2000);

  await page.evaluate(() => localStorage.removeItem('hoursComparison'));
  await homePage.goto();

  const restaurant1 = await homePage.getRestaurantIdFromCard(0);
  const restaurant2 = await homePage.getRestaurantIdFromCard(1);

  await page.getByTestId(`compare-hours-button-${restaurant1}`).click();
  await page.waitForTimeout(500);
  await page.getByTestId(`compare-hours-button-${restaurant2}`).click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId('comparison-badge')).toBeVisible();
  await expect(page.getByTestId('comparison-badge')).toContainText('2');

  const restaurant3 = await homePage.getRestaurantIdFromCard(2);
  await restaurantDetailsPage.goto(restaurant3);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  expect(page.url()).toContain('/restaurants/');

  await expect(page.getByTestId('comparison-badge')).toBeVisible();
  await expect(page.getByTestId('comparison-badge')).toContainText('2');

  await expect(page.getByTestId('compare-hours-action-button')).toBeVisible();
  await expect(page.getByTestId('compare-hours-action-button')).toContainText('Compare Hours');

  await page.getByTestId('compare-hours-action-button').click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId('compare-hours-action-button-active')).toBeVisible();
  await expect(page.getByTestId('compare-hours-action-button-active')).toContainText('Remove from Comparison');
  await expect(page.getByTestId('comparison-badge')).toContainText('3');
});