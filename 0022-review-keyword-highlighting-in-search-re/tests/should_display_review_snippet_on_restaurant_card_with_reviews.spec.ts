import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Review Snippet Display', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display review snippet on restaurant card with reviews', async ({ page }) => {
    await homePage.expectRestaurantCardsToBeVisible();

    const reviewSnippets = page.locator('[data-testid="review-snippet"]');
    const snippetCount = await reviewSnippets.count();
    expect(snippetCount).toBeGreaterThan(0);

    const firstSnippet = reviewSnippets.first();
    await expect(firstSnippet).toBeVisible();

    const snippetText = await firstSnippet.textContent();
    expect(snippetText).toBeTruthy();
    expect(snippetText!.length).toBeLessThanOrEqual(103);
  });
});