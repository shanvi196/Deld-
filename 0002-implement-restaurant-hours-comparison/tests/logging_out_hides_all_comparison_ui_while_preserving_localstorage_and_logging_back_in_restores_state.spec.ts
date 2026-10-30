import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Logging out hides all comparison UI while preserving localStorage and logging back in restores state', async ({ page }) => {
  const homePage = new HomePage(page);
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

  await expect(page.getByTestId('hours-comparison-sidebar')).toBeVisible();
  await expect(page.getByTestId('sidebar-comparison-count')).toContainText('Compare Hours (2)');
  await expect(page.getByTestId('comparison-badge')).toContainText('2');

  const preLogoutData = await page.evaluate(() => {
    const data = localStorage.getItem('hoursComparison');
    return data ? JSON.parse(data) : null;
  });
  expect(preLogoutData.restaurants.length).toBe(2);
  expect(preLogoutData.userId).toBeTruthy();

  await homePage.topBar.openUserMenu();
  await homePage.topBar.userAvatarMenuLogout.click();
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');

  await expect(page.getByTestId('hours-comparison-sidebar')).not.toBeVisible();
  await expect(page.getByTestId('comparison-badge')).not.toBeVisible();

  const compareButtonsAfterLogout = page.locator('[data-testid^="compare-hours-button-"]');
  expect(await compareButtonsAfterLogout.count()).toBe(0);

  const postLogoutData = await page.evaluate(() => {
    const data = localStorage.getItem('hoursComparison');
    return data ? JSON.parse(data) : null;
  });
  expect(postLogoutData.restaurants.length).toBe(2);

  await homePage.expectLoginButtonToBeVisible();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(2000);
  await homePage.goto();

  await expect(page.getByTestId('hours-comparison-sidebar')).toBeVisible();
  await expect(page.getByTestId('sidebar-comparison-count')).toContainText('Compare Hours (2)');
  await expect(page.getByTestId('comparison-badge')).toContainText('2');

  const comparisonItems = page.locator('[data-testid^="comparison-item-"]');
  expect(await comparisonItems.count()).toBe(2);

  await expect(page.getByTestId(`compare-hours-button-${restaurant1}-active`)).toBeVisible();
  await expect(page.getByTestId(`compare-hours-button-${restaurant2}-active`)).toBeVisible();
});