import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Print Button Functionality', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test('print button triggers browser print dialog', async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();

    let printCallCount = 0;
    await page.exposeFunction('__trackPrint', () => {
      printCallCount++;
    });

    await page.evaluate(() => {
      window.print = () => {
        (window as unknown as { __trackPrint: () => void }).__trackPrint();
      };
    });

    const printButton = page.getByTestId('print-button');
    await printButton.click();

    await page.waitForTimeout(500);

    expect(printCallCount).toBe(1);
  });
});