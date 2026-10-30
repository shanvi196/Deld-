import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('User ID mismatch on login clears stale hoursComparison data and starts with empty comparison state', async ({ page }) => {
  const homePage = new HomePage(page);

  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => {
    localStorage.setItem('hoursComparison', JSON.stringify({
      restaurants: [
        { id: 'fake-restaurant-001', addedAt: 1700000000000 },
        { id: 'fake-restaurant-002', addedAt: 1700000001000 }
      ],
      userId: 'different-user-id-999'
    }));
  });

  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(2000);

  await homePage.goto();

  await expect(page.getByTestId('hours-comparison-sidebar')).not.toBeVisible();
  await expect(page.getByTestId('comparison-badge')).not.toBeVisible();

  const firstRestaurantId = await homePage.getRestaurantIdFromCard(0);
  await expect(page.getByTestId(`compare-hours-button-${firstRestaurantId}`)).toBeVisible();
  await expect(page.getByTestId(`compare-hours-button-${firstRestaurantId}-active`)).not.toBeVisible();

  const storageData = await page.evaluate(() => {
    const data = localStorage.getItem('hoursComparison');
    return data ? JSON.parse(data) : null;
  });
  const restaurantCount = storageData?.restaurants?.length ?? 0;
  expect(restaurantCount).toBe(0);

  await page.getByTestId(`compare-hours-button-${firstRestaurantId}`).click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId(`compare-hours-button-${firstRestaurantId}-active`)).toBeVisible();
  await expect(page.getByTestId('hours-comparison-sidebar')).toBeVisible();
  await expect(page.getByTestId('sidebar-comparison-count')).toContainText('Compare Hours (1)');

  const newStorageData = await page.evaluate(() => {
    const data = localStorage.getItem('hoursComparison');
    return data ? JSON.parse(data) : null;
  });
  expect(newStorageData.restaurants.length).toBe(1);
  expect(newStorageData.userId).not.toBe('different-user-id-999');
});