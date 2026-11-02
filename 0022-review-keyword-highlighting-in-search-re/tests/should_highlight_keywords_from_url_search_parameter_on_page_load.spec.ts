import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('URL Search Parameter Highlighting', () => {
  test('should highlight keywords from URL search parameter on page load', async ({ page }) => {
    await page.goto('http://localhost:3000/?query=food');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const homePage = new HomePage(page);
    await homePage.expectSearchQueryValue('food');

    const highlightedKeywords = page.locator('[data-testid="highlighted-keyword"]');
    await expect(highlightedKeywords.first()).toBeVisible({ timeout: 10000 });

    const highlightCount = await highlightedKeywords.count();
    expect(highlightCount).toBeGreaterThan(0);

    const firstHighlight = highlightedKeywords.first();
    const highlightText = await firstHighlight.textContent();
    expect(highlightText?.toLowerCase()).toContain('food');
  });
});