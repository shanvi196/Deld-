import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Full round-trip persistence across page navigations verifying sidebar state is restored from localStorage on remount', async ({ page }) => {
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

  const storageData = await page.evaluate(() => {
    const data = localStorage.getItem('hoursComparison');
    return data ? JSON.parse(data) : null;
  });
  expect(storageData.restaurants.length).toBe(2);
  expect(storageData.userId).toBeTruthy();

  const restaurant3Id = await homePage.getRestaurantIdFromCard(2);
  await page.goto(`http://localhost:3000/restaurants/${restaurant3Id}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  expect(page.url()).toContain('/restaurants/');
  await expect(page.getByTestId('comparison-badge')).toContainText('2');

  await homePage.goto();

  await expect(page.getByTestId('hours-comparison-sidebar')).toBeVisible();
  await expect(page.getByTestId('sidebar-comparison-count')).toContainText('Compare Hours (2)');

  const comparisonItems = page.locator('[data-testid^="comparison-item-"]');
  expect(await comparisonItems.count()).toBe(2);

  await expect(page.getByTestId(`compare-hours-button-${restaurant1}-active`)).toBeVisible();
  await expect(page.getByTestId(`compare-hours-button-${restaurant2}-active`)).toBeVisible();
  await expect(page.getByTestId('comparison-badge')).toContainText('2');
});