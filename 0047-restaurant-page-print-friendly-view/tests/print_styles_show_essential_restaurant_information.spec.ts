import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Print Styles Show Essential Info', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test('print styles show essential restaurant information', async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();

    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);

    let visibleElementCount = 0;

    const restaurantName = page.getByTestId('restaurant-info-name');
    const nameCount = await restaurantName.count();
    if (nameCount > 0) {
      const visibility = await restaurantName.evaluate((el) => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      expect(visibility).toBe(true);
      visibleElementCount++;
    }

    const addressBlock = page.getByTestId('address-block');
    const addressCount = await addressBlock.count();
    if (addressCount > 0) {
      const visibility = await addressBlock.evaluate((el) => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      expect(visibility).toBe(true);
      visibleElementCount++;
    }

    const openingHours = page.getByTestId('opening-hours-block');
    const hoursCount = await openingHours.count();
    if (hoursCount > 0) {
      const visibility = await openingHours.evaluate((el) => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      expect(visibility).toBe(true);
      visibleElementCount++;
    }

    const overallRating = page.getByTestId('overall-rating-section');
    const ratingCount = await overallRating.count();
    if (ratingCount > 0) {
      const visibility = await overallRating.evaluate((el) => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      expect(visibility).toBe(true);
      visibleElementCount++;
    }

    expect(visibleElementCount).toBeGreaterThan(0);
  });
});