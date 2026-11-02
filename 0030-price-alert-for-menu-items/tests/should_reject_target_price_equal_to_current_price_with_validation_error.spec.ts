import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Price Alert Validation', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test('should reject target price equal to current price with validation error', async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();

    await page.evaluate(() => localStorage.removeItem('priceAlerts'));

    const menuItems = page.locator('[data-testid^="menu-item-"]');
    await expect(menuItems.first()).toBeVisible();

    const alertMeButton = page.getByTestId('alert-me-button').first();
    await alertMeButton.click();

    const priceAlertModal = page.getByTestId('price-alert-modal');
    await expect(priceAlertModal).toBeVisible();

    let priceAlerts = await page.evaluate(() => JSON.parse(localStorage.getItem('priceAlerts') || '[]'));
    expect(priceAlerts.length).toBe(0);

    const targetPriceInput = page.getByTestId('target-price-input');
    await targetPriceInput.fill('12.99');

    const saveAlertButton = page.getByTestId('save-alert-button');
    await saveAlertButton.click();

    await page.waitForTimeout(500);

    const errorMessage = priceAlertModal.getByText('Target price must be below current price');
    await expect(errorMessage).toBeVisible();

    priceAlerts = await page.evaluate(() => JSON.parse(localStorage.getItem('priceAlerts') || '[]'));
    expect(priceAlerts.length).toBe(0);

    await expect(priceAlertModal).toBeVisible();
  });
});