import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test('Compare button opens login dialog when user is not logged in and does not add to list', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  const initialKeys = await page.evaluate(() => {
    return Object.keys(localStorage).filter(k => k.startsWith('comparisonList-'));
  });
  expect(initialKeys.length).toBe(0);

  const firstRestaurantId = await homePage.getRestaurantIdFromCard(0);

  await page.getByTestId(`restaurant-card-compare-button-${firstRestaurantId}`).click();
  await page.waitForTimeout(1000);

  await homePage.loginComponent.expectDialogToBeVisible();

  await expect(page.getByTestId(`restaurant-card-compare-button-${firstRestaurantId}`)).toHaveAttribute('aria-pressed', 'false');

  const afterKeys = await page.evaluate(() => {
    return Object.keys(localStorage).filter(k => k.startsWith('comparisonList-'));
  });
  expect(afterKeys.length).toBe(0);

  await expect(page.getByTestId('comparison-bar')).not.toBeVisible();
});