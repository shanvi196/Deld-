import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test('Removing individual chip updates localStorage and decrements visible chip count', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await page.evaluate(() => {
    const searches = [
      { query: 'tacos', location: '', timestamp: Date.now() },
      { query: 'ramen', location: '', timestamp: Date.now() - 1000 },
      { query: 'burgers', location: '', timestamp: Date.now() - 2000 }
    ];
    localStorage.setItem('recentSearches_guest', JSON.stringify(searches));
  });

  await page.reload();
  await page.waitForLoadState('networkidle');

  await expect(page.getByTestId('recent-searches-section')).toBeVisible();
  await expect(page.getByTestId('recent-search-chip-0')).toBeVisible();
  await expect(page.getByTestId('recent-search-chip-1')).toBeVisible();
  await expect(page.getByTestId('recent-search-chip-2')).toBeVisible();

  await page.getByTestId('recent-search-chip-remove-1').click();
  await page.waitForTimeout(500);

  let stored = await page.evaluate(() => {
    const data = localStorage.getItem('recentSearches_guest');
    return data ? JSON.parse(data) : [];
  });
  expect(stored).toHaveLength(2);

  await expect(page.getByTestId('recent-search-chip-0')).toContainText('tacos');
  await expect(page.getByTestId('recent-search-chip-1')).toContainText('burgers');

  const ramenEntry = stored.find((s: { query: string }) => s.query === 'ramen');
  expect(ramenEntry).toBeUndefined();

  await page.getByTestId('recent-search-chip-remove-0').click();
  await page.waitForTimeout(500);
  await page.getByTestId('recent-search-chip-remove-0').click();
  await page.waitForTimeout(500);

  stored = await page.evaluate(() => {
    const data = localStorage.getItem('recentSearches_guest');
    return data ? JSON.parse(data) : [];
  });
  expect(stored).toHaveLength(0);

  await expect(page.getByTestId('recent-searches-section')).not.toBeVisible();
});