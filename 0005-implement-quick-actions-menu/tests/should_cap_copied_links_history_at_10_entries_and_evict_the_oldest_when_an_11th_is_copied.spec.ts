import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('should cap copied links history at 10 entries and evict the oldest when an 11th is copied', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await homePage.goto();
  await homePage.expectRestaurantCardsToBeVisible();

  await page.evaluate(() => {
    const entries = [];
    for (let i = 10; i >= 1; i--) {
      entries.push({
        restaurantId: 'old-rest-' + String(i).padStart(2, '0'),
        restaurantName: 'Old Restaurant ' + i,
        copiedAt: new Date(Date.now() - (11 - i) * 60000).toISOString()
      });
    }
    localStorage.setItem('deld:copied-links:user_0001', JSON.stringify(entries));
  });

  const restaurantId = await homePage.getRestaurantIdFromCard(0);

  await homePage.getRestaurantCardByIndex(0).hover();
  await page.waitForTimeout(500);

  await page.getByTestId('quick-actions-trigger-' + restaurantId).click();
  await page.waitForTimeout(500);

  await page.getByTestId('quick-action-copy-' + restaurantId).click();
  await page.waitForTimeout(1000);

  await expect(page.getByText('Link copied!')).toBeVisible();

  const stored = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('deld:copied-links:user_0001') || '[]');
  });

  expect(stored.length).toBe(10);
  expect(stored[0].restaurantId).toBe(restaurantId);

  const oldestEvicted = stored.find((e: any) => e.restaurantId === 'old-rest-01');
  expect(oldestEvicted).toBeUndefined();

  const newestOldKept = stored.find((e: any) => e.restaurantId === 'old-rest-10');
  expect(newestOldKept).toBeDefined();
});