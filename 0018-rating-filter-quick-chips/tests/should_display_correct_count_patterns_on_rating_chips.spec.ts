import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Rating Filter Chips - Display counts', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
    await restaurantDetailsPage.scrollToReviews();
    await page.waitForTimeout(1000);
  });

  test('should display correct count patterns on rating chips', async ({ page }) => {
    const ratingChip5 = page.getByTestId('rating-chip-5');
    const ratingChip4 = page.getByTestId('rating-chip-4');
    const ratingChip3 = page.getByTestId('rating-chip-3');

    await expect(ratingChip5).toBeVisible();
    await expect(ratingChip4).toBeVisible();
    await expect(ratingChip3).toBeVisible();

    const chip5Text = await ratingChip5.textContent();
    const chip4Text = await ratingChip4.textContent();
    const chip3Text = await ratingChip3.textContent();

    expect(chip5Text).toMatch(/5★\s*\(\d+\)/);
    expect(chip4Text).toMatch(/4★\+?\s*\(\d+\)/);
    expect(chip3Text).toMatch(/3★\+?\s*\(\d+\)/);

    const count5Match = chip5Text?.match(/\((\d+)\)/);
    const count4Match = chip4Text?.match(/\((\d+)\)/);
    const count3Match = chip3Text?.match(/\((\d+)\)/);

    if (count5Match && count4Match && count3Match) {
      const count5 = parseInt(count5Match[1], 10);
      const count4 = parseInt(count4Match[1], 10);
      const count3 = parseInt(count3Match[1], 10);

      expect(count4).toBeGreaterThanOrEqual(count5);
      expect(count3).toBeGreaterThanOrEqual(count4);
    }
  });
});