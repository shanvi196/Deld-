import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test('Empty and whitespace-only searches are not saved to history', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await page.evaluate(() => localStorage.removeItem('recentSearches_guest'));

  await homePage.fillSearchQuery('   ');
  await homePage.fillSearchLocation('');
  await homePage.clickSearchSubmit();
  await page.waitForTimeout(1000);

  const emptyStored = await page.evaluate(() => {
    const data = localStorage.getItem('recentSearches_guest');
    if (!data) return [];
    return JSON.parse(data);
  });
  expect(emptyStored).toHaveLength(0);

  await expect(page.getByTestId('recent-searches-section')).not.toBeVisible();

  await homePage.fillSearchQuery('pizza');
  await homePage.clickSearchSubmit();
  await page.waitForTimeout(1000);

  const stored = await page.evaluate(() => {
    const data = localStorage.getItem('recentSearches_guest');
    return data ? JSON.parse(data) : [];
  });
  expect(stored).toHaveLength(1);
  expect(stored[0].query).toBe('pizza');
});