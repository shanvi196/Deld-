import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('No Highlighting Without Search Query', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should not display highlights when no search query is present', async ({ page }) => {
    await homePage.expectRestaurantCardsToBeVisible();

    const reviewSnippets = page.locator('[data-testid="review-snippet"]');
    const snippetCount = await reviewSnippets.count();
    expect(snippetCount).toBeGreaterThan(0);

    const highlightedKeywords = page.locator('[data-testid="highlighted-keyword"]');
    const highlightCount = await highlightedKeywords.count();
    expect(highlightCount).toBe(0);
  });
});