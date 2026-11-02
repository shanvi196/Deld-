import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Short reviews show minimum 1 minute reading time', async ({ page }) => {
  const restaurantDetailsPage = new RestaurantDetailsPage(page);
  
  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();
  await restaurantDetailsPage.scrollToReviews();
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.waitForTimeout(1000);
  
  const readingTimeBadges = page.locator('[data-testid="reading-time-badge"]');
  await expect(readingTimeBadges.first()).toBeVisible();
  
  const badgeCount = await readingTimeBadges.count();
  
  for (let i = 0; i < badgeCount; i++) {
    const badge = readingTimeBadges.nth(i);
    const badgeText = await badge.textContent();
    
    expect(badgeText).not.toContain('0 min read');
    expect(badgeText).toMatch(/^\d+ min read$/);
    
    const minutes = parseInt(badgeText?.match(/\d+/)?.[0] || '0');
    expect(minutes).toBeGreaterThanOrEqual(1);
  }
});