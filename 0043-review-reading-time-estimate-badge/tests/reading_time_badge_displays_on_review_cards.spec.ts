import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Reading time badge displays on review cards', async ({ page }) => {
  const restaurantDetailsPage = new RestaurantDetailsPage(page);
  
  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();
  await restaurantDetailsPage.scrollToReviews();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1000);
  
  const reviewCards = page.locator('[data-testid="review-card"]');
  await expect(reviewCards.first()).toBeVisible();
  
  const firstReviewBadge = page.locator('[data-testid="reading-time-badge"]').first();
  await expect(firstReviewBadge).toBeVisible();
  
  const badgeText = await firstReviewBadge.textContent();
  expect(badgeText).toMatch(/\d+ min read/);
});