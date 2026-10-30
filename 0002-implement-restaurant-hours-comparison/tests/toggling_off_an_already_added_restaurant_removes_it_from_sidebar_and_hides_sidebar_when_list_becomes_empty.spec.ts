import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Toggling off an already-added restaurant removes it from sidebar and hides sidebar when list becomes empty', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(2000);

  await page.evaluate(() => localStorage.removeItem('hoursComparison'));
  await homePage.goto();

  const firstRestaurantId = await homePage.getRestaurantIdFromCard(0);

  await page.getByTestId(`compare-hours-button-${firstRestaurantId}`).click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId(`compare-hours-button-${firstRestaurantId}-active`)).toBeVisible();
  await expect(page.getByTestId('hours-comparison-sidebar')).toBeVisible();
  await expect(page.getByTestId('sidebar-comparison-count')).toContainText('Compare Hours (1)');
  await expect(page.getByTestId(`comparison-item-${firstRestaurantId}`)).toBeVisible();

  await page.getByTestId(`compare-hours-button-${firstRestaurantId}-active`).click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId(`compare-hours-button-${firstRestaurantId}-active`)).not.toBeVisible();
  await expect(page.getByTestId(`compare-hours-button-${firstRestaurantId}`)).toBeVisible();
  await expect(page.getByTestId('hours-comparison-sidebar')).not.toBeVisible();
  await expect(page.getByTestId('comparison-badge')).not.toBeVisible();

  const storageData = await page.evaluate(() => {
    const data = localStorage.getItem('hoursComparison');
    return data ? JSON.parse(data) : null;
  });
  const restaurantCount = storageData?.restaurants?.length ?? 0;
  expect(restaurantCount).toBe(0);
});