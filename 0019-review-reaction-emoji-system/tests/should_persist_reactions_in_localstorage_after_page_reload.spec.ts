import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Reaction Emoji System - LocalStorage Persistence', () => {
  test('should persist reactions in localStorage after page reload', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Scroll to reviews section
    const reviewsSection = page.getByTestId('recommended-reviews-section');
    await reviewsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Find the first review and get its reviewId from the DOM
    const hungryButton = page.locator('[data-testid^="reaction-btn-hungry-"]').first();
    await expect(hungryButton).toBeVisible();
    const reviewId = await hungryButton.getAttribute('data-testid').then(id => id?.replace('reaction-btn-hungry-', ''));

    // Click the "Made Me Hungry" (😋) reaction button
    await hungryButton.click();
    await page.waitForTimeout(500);

    // Verify localStorage key "review-reactions" exists and contains valid JSON
    const localStorageData = await page.evaluate(() => localStorage.getItem('review-reactions'));
    expect(localStorageData).not.toBeNull();

    const parsedData = JSON.parse(localStorageData!);
    expect(parsedData[reviewId!]).toBe('hungry');

    // Reload the page
    await page.reload();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Scroll to reviews again
    await page.getByTestId('recommended-reviews-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // The "Made Me Hungry" button should still have aria-pressed="true"
    const hungryButtonAfterReload = page.getByTestId(`reaction-btn-hungry-${reviewId}`);
    await expect(hungryButtonAfterReload).toHaveAttribute('aria-pressed', 'true');

    // The count should display "1"
    const countElement = page.getByTestId(`reaction-count-hungry-${reviewId}`);
    await expect(countElement).toHaveText('1');
  });
});