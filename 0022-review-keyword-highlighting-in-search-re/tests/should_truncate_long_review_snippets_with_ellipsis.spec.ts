import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Review Snippet Truncation', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should truncate long review snippets with ellipsis', async ({ page }) => {
    await homePage.expectRestaurantCardsToBeVisible();

    const reviewSnippets = page.locator('[data-testid="review-snippet"]');
    const snippetCount = await reviewSnippets.count();
    expect(snippetCount).toBeGreaterThan(0);

    let foundTruncated = false;
    for (let i = 0; i < Math.min(snippetCount, 10); i++) {
      const snippet = reviewSnippets.nth(i);
      const text = await snippet.textContent();
      if (text && text.endsWith('...')) {
        foundTruncated = true;
        expect(text.length).toBeLessThanOrEqual(103);
        break;
      }
    }
    expect(foundTruncated).toBe(true);
  });
});