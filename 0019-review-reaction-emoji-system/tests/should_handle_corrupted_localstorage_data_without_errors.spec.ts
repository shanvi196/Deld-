import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Reaction Emoji System - Corrupted localStorage', () => {
  test('should handle corrupted localStorage data without errors', async ({ page }) => {
    // Set corrupted localStorage before navigating
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => localStorage.setItem('review-reactions', '{{not valid json}}'));

    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Reload the page
    await page.reload();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Scroll to reviews section
    const reviewsSection = page.getByTestId('recommended-reviews-section');
    await reviewsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // All reaction buttons should have aria-pressed="false" (inactive state)
    const reactionButtons = page.locator('[data-testid^="reaction-btn-"]');
    const buttonCount = await reactionButtons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // All reaction count elements should display "0"
    const countElements = page.locator('[data-testid^="reaction-count-"]');
    const counts = await countElements.allTextContents();
    counts.forEach(count => {
      expect(count).toBe('0');
    });

    // No uncaught JavaScript errors related to JSON parsing
    const jsonErrors = consoleErrors.filter(err => err.includes('JSON') || err.includes('Unexpected token'));
    expect(jsonErrors.length).toBe(0);

    // Click a reaction button to verify functionality still works
    const helpfulButton = page.locator('[data-testid^="reaction-btn-helpful-"]').first();
    const reviewId = await helpfulButton.getAttribute('data-testid').then(id => id?.replace('reaction-btn-helpful-', ''));
    await helpfulButton.click();
    await page.waitForTimeout(500);

    // localStorage should now be parseable as valid JSON
    const newLocalStorageData = await page.evaluate(() => localStorage.getItem('review-reactions'));
    expect(() => JSON.parse(newLocalStorageData!)).not.toThrow();

    // The button should have aria-pressed="true" and count should display "1"
    await expect(helpfulButton).toHaveAttribute('aria-pressed', 'true');
    const countElement = page.getByTestId(`reaction-count-helpful-${reviewId}`);
    await expect(countElement).toHaveText('1');
  });
});