import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Keyword Highlighting on Search', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should highlight keywords when search query matches review text', async ({ page }) => {
    await homePage.fillSearchQuery('food');
    await homePage.waitForSearchDebounce();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const highlightedKeywords = page.locator('[data-testid="highlighted-keyword"]');
    await expect(highlightedKeywords.first()).toBeVisible({ timeout: 10000 });

    const highlightCount = await highlightedKeywords.count();
    expect(highlightCount).toBeGreaterThan(0);

    const firstHighlight = highlightedKeywords.first();
    await expect(firstHighlight).toHaveClass(/bg-yellow-200/);

    const highlightText = await firstHighlight.textContent();
    expect(highlightText?.toLowerCase()).toContain('food');
  });
});