import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Reaction Emoji System - Multiple Reviews Independence', () => {
  test('should maintain independent reaction states across multiple reviews', async ({ page }) => {
    // Clear localStorage first
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => localStorage.removeItem('review-reactions'));
    await page.reload();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Scroll to reviews section
    const reviewsSection = page.getByTestId('recommended-reviews-section');
    await reviewsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Get at least 2 review reaction containers
    const reactionContainers = page.locator('[data-testid^="reaction-buttons-"]');
    const containerCount = await reactionContainers.count();
    expect(containerCount).toBeGreaterThanOrEqual(2);

    // Get reviewIds for first and second reviews
    const review1Id = await reactionContainers.first().getAttribute('data-testid').then(id => id?.replace('reaction-buttons-', ''));
    const review2Id = await reactionContainers.nth(1).getAttribute('data-testid').then(id => id?.replace('reaction-buttons-', ''));

    // Click Helpful on first review
    const helpfulBtn1 = page.getByTestId(`reaction-btn-helpful-${review1Id}`);
    await helpfulBtn1.click();
    await page.waitForTimeout(500);

    // Click Great Photos on second review
    const photosBtn2 = page.getByTestId(`reaction-btn-photos-${review2Id}`);
    await photosBtn2.click();
    await page.waitForTimeout(500);

    // Verify first review has helpful active
    const helpfulCount1 = page.getByTestId(`reaction-count-helpful-${review1Id}`);
    await expect(helpfulCount1).toHaveText('1');
    await expect(helpfulBtn1).toHaveAttribute('aria-pressed', 'true');

    // Verify second review has photos active
    const photosCount2 = page.getByTestId(`reaction-count-photos-${review2Id}`);
    await expect(photosCount2).toHaveText('1');
    await expect(photosBtn2).toHaveAttribute('aria-pressed', 'true');

    // Verify localStorage contains both entries
    const localStorageData = await page.evaluate(() => localStorage.getItem('review-reactions'));
    const parsedData = JSON.parse(localStorageData!);
    expect(parsedData[review1Id!]).toBe('helpful');
    expect(parsedData[review2Id!]).toBe('photos');

    // Reload and verify persistence
    await page.reload();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.getByTestId('recommended-reviews-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Both reactions should remain in their active states
    await expect(page.getByTestId(`reaction-count-helpful-${review1Id}`)).toHaveText('1');
    await expect(page.getByTestId(`reaction-count-photos-${review2Id}`)).toHaveText('1');
    await expect(page.getByTestId(`reaction-btn-helpful-${review1Id}`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId(`reaction-btn-photos-${review2Id}`)).toHaveAttribute('aria-pressed', 'true');
  });
});