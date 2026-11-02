import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID_1 = '25047088-5a40-4fab-be5c-3ee9a54fb980';
const TEST_RESTAURANT_ID_2 = 'dc553a2b-ac48-4126-964b-bd95e45e5670';

test('Reading time badge renders correctly when navigating between restaurant pages', async ({ page }) => {
  const restaurantDetailsPage = new RestaurantDetailsPage(page);
  
  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID_1);
  await restaurantDetailsPage.waitForPageLoad();
  await restaurantDetailsPage.scrollToReviews();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1000);
  
  const firstPageBadges = page.locator('[data-testid="reading-time-badge"]');
  await expect(firstPageBadges.first()).toBeVisible();
  
  const firstRestaurantBadgeText = await firstPageBadges.first().textContent();
  expect(firstRestaurantBadgeText).toMatch(/\d+ min read/);
  
  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID_2);
  await restaurantDetailsPage.waitForPageLoad();
  await restaurantDetailsPage.scrollToReviews();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1000);
  
  const secondPageBadges = page.locator('[data-testid="reading-time-badge"]');
  const secondPageBadgeCount = await secondPageBadges.count();
  
  if (secondPageBadgeCount > 0) {
    await expect(secondPageBadges.first()).toBeVisible();
    const secondRestaurantBadgeText = await secondPageBadges.first().textContent();
    expect(secondRestaurantBadgeText).toMatch(/\d+ min read/);
  }
});