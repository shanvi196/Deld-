import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test('Corrupted or malformed localStorage data is handled gracefully without crashing', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await page.evaluate(() => {
    localStorage.setItem('recentSearches_guest', 'not-valid-json{{{');
  });

  await page.reload();
  await page.waitForLoadState('networkidle');

  await homePage.expectRestaurantCardsToBeVisible();
  await expect(page.getByTestId('recent-searches-section')).not.toBeVisible();

  await homePage.fillSearchQuery('recovery-test');
  await homePage.fillSearchLocation('Denver, CO');
  await homePage.clickSearchSubmit();
  await page.waitForTimeout(1000);

  const stored = await page.evaluate(() => {
    const data = localStorage.getItem('recentSearches_guest');
    return data ? JSON.parse(data) : [];
  });

  expect(stored).toHaveLength(1);
  expect(stored[0].query).toBe('recovery-test');
  expect(stored[0].location).toBe('Denver, CO');

  await expect(page.getByTestId('recent-search-chip-0')).toContainText('recovery-test');
  await expect(page.getByTestId('recent-search-chip-0')).toContainText('Denver, CO');
});