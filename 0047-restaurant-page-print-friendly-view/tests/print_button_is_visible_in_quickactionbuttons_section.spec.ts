import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Print Button Visibility', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test('print button is visible in QuickActionButtons section', async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();

    const printButton = page.getByTestId('print-button');
    await expect(printButton).toBeVisible();

    const quickActionButtons = page.getByTestId('quick-action-buttons');
    await expect(quickActionButtons).toBeVisible();

    await expect(quickActionButtons.getByTestId('print-button')).toBeVisible();

    const printerIcon = printButton.locator('svg');
    await expect(printerIcon).toBeVisible();
  });
});