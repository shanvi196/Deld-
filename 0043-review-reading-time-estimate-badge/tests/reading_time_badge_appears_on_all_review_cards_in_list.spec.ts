import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Reading time badge appears on all review cards in list', async ({ page }) => {
  const restaurantDetailsPage = new RestaurantDetailsPage(page);
  
  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();
  await restaurantDetailsPage.scrollToReviews();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1000);
  
  const reviewCards = page.locator('[data-testid="review-card"]');
  const reviewCardCount = await reviewCards.count();
  expect(reviewCardCount).toBeGreaterThan(0);
  
  const readingTimeBadges = page.locator('[data-testid="reading-time-badge"]');
  const badgeCount = await readingTimeBadges.count();
  
  expect(badgeCount).toBe(reviewCardCount);
});