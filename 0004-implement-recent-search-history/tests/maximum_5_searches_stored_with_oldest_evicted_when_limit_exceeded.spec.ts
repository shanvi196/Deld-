import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test('Maximum 5 searches stored with oldest evicted when limit exceeded', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await page.evaluate(() => localStorage.removeItem('recentSearches_guest'));
  await page.reload();
  await page.waitForLoadState('networkidle');

  const queries = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot'];

  for (const query of queries) {
    await homePage.fillSearchQuery(query);
    await homePage.fillSearchLocation('');
    await homePage.clickSearchSubmit();
    await page.waitForTimeout(1000);
  }

  const stored = await page.evaluate(() => {
    const data = localStorage.getItem('recentSearches_guest');
    return data ? JSON.parse(data) : [];
  });

  expect(stored).toHaveLength(5);
  expect(stored[0].query).toBe('foxtrot');
  expect(stored[stored.length - 1].query).toBe('bravo');

  const alphaEntry = stored.find((s: { query: string }) => s.query === 'alpha');
  expect(alphaEntry).toBeUndefined();

  await expect(page.getByTestId('recent-searches-section')).toBeVisible();

  for (let i = 0; i < 5; i++) {
    await expect(page.getByTestId(`recent-search-chip-${i}`)).toBeVisible();
  }

  await expect(page.getByTestId('recent-search-chip-0')).toContainText('foxtrot');
});