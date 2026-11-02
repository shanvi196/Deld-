import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Reading time badge persists after review list refresh', async ({ page }) => {
  const restaurantDetailsPage = new RestaurantDetailsPage(page);
  
  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();
  await restaurantDetailsPage.scrollToReviews();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1000);
  
  const readingTimeBadges = page.locator('[data-testid="reading-time-badge"]');
  const initialBadgeCount = await readingTimeBadges.count();
  expect(initialBadgeCount).toBeGreaterThan(0);
  
  const initialBadgeValues: string[] = [];
  for (let i = 0; i < Math.min(initialBadgeCount, 3); i++) {
    const text = await readingTimeBadges.nth(i).textContent();
    initialBadgeValues.push(text || '');
  }
  
  await page.reload();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await restaurantDetailsPage.scrollToReviews();
  await page.waitForTimeout(1000);
  
  const reloadedBadges = page.locator('[data-testid="reading-time-badge"]');
  const reloadedBadgeCount = await reloadedBadges.count();
  expect(reloadedBadgeCount).toBe(initialBadgeCount);
  
  for (let i = 0; i < Math.min(reloadedBadgeCount, 3); i++) {
    const text = await reloadedBadges.nth(i).textContent();
    expect(text).toBe(initialBadgeValues[i]);
  }
});