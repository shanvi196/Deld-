import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Chip click replays search with URL params on homepage; Clear History on detail page removes all entries', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);
  await homePage.goto();

  await page.evaluate(() => {
    const searches = [
      { query: 'sushi', location: 'San Francisco, CA', timestamp: 1700000000000 },
      { query: 'pizza', location: '', timestamp: 1699999000000 }
    ];
    localStorage.setItem('recentSearches_guest', JSON.stringify(searches));
  });

  await page.reload();
  await page.waitForLoadState('networkidle');

  await expect(page.getByTestId('recent-searches-section')).toBeVisible();
  await expect(page.getByTestId('recent-search-chip-0')).toBeVisible();
  await expect(page.getByTestId('recent-search-chip-1')).toBeVisible();

  await page.getByTestId('recent-search-chip-0').click();
  await page.waitForTimeout(1000);

  await homePage.expectSearchQueryValue('sushi');
  await homePage.expectSearchLocationValue('San Francisco, CA');
  await homePage.expectUrlToContainSearchParams('sushi', 'San Francisco, CA');

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();

  await expect(page.getByTestId('detail-recent-searches-section')).toBeVisible();
  await expect(page.getByTestId('recent-search-chip-0')).toContainText('sushi');
  await expect(page.getByTestId('recent-search-chip-0')).toContainText('San Francisco, CA');

  await page.getByTestId('detail-clear-search-history-button').click();
  await page.waitForTimeout(500);

  const stored = await page.evaluate(() => {
    const data = localStorage.getItem('recentSearches_guest');
    return data ? JSON.parse(data) : [];
  });
  expect(stored).toHaveLength(0);

  await expect(page.getByTestId('detail-recent-searches-section')).not.toBeVisible();

  await homePage.goto();

  await expect(page.getByTestId('recent-searches-section')).not.toBeVisible();
});