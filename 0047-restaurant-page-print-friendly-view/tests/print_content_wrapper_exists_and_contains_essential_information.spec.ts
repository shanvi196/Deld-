import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Print Content Wrapper', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test('print content wrapper exists and contains essential information', async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();

    const printContent = page.getByTestId('print-content');
    await expect(printContent).toBeVisible();

    const restaurantName = printContent.getByTestId('restaurant-info-name');
    const nameExists = await restaurantName.count() > 0;

    const nameInContent = printContent.locator('h1, h2, [data-testid*="name"]').first();
    const nameInContentExists = await nameInContent.count() > 0;

    expect(nameExists || nameInContentExists).toBe(true);

    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(300);

    const printContentVisibility = await printContent.evaluate((el) => {
      const style = getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    expect(printContentVisibility).toBe(true);
  });
});