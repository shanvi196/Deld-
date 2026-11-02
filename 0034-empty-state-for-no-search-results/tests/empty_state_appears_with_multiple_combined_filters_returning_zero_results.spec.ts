import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Empty Search State - Multiple combined filters', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('empty state appears with multiple combined filters returning zero results', async ({ page }) => {
    await page.goto('http://localhost:3000/?categories=gastropub&price=$$$$&openNow=true&distance=1');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const emptyState = page.getByTestId('empty-search-state');
    await expect(emptyState).toBeVisible();

    const subtext = page.getByTestId('empty-state-subtext');
    await expect(subtext).toContainText('Try adjusting your filters');
  });
});