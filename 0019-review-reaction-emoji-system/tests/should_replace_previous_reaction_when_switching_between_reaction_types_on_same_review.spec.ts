import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Reaction Emoji System - Switch Reaction Types', () => {
  test('should replace previous reaction when switching between reaction types on same review', async ({ page }) => {
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

    // Get the first review's ID
    const helpfulButton = page.locator('[data-testid^="reaction-btn-helpful-"]').first();
    await expect(helpfulButton).toBeVisible();
    const reviewId = await helpfulButton.getAttribute('data-testid').then(id => id?.replace('reaction-btn-helpful-', ''));

    // Click Helpful first
    await helpfulButton.click();
    await page.waitForTimeout(500);

    // Verify helpful is selected
    const helpfulCount = page.getByTestId(`reaction-count-helpful-${reviewId}`);
    await expect(helpfulCount).toHaveText('1');
    await expect(helpfulButton).toHaveAttribute('aria-pressed', 'true');

    // Now click Great Photos
    const photosButton = page.getByTestId(`reaction-btn-photos-${reviewId}`);
    await photosButton.click();
    await page.waitForTimeout(500);

    // Photos should now be active with count 1
    const photosCount = page.getByTestId(`reaction-count-photos-${reviewId}`);
    await expect(photosCount).toHaveText('1');
    await expect(photosButton).toHaveAttribute('aria-pressed', 'true');

    // Helpful should be inactive with count 0
    await expect(helpfulCount).toHaveText('0');
    await expect(helpfulButton).toHaveAttribute('aria-pressed', 'false');

    // Verify localStorage contains exactly one entry for that reviewId with value "photos"
    const localStorageData = await page.evaluate(() => localStorage.getItem('review-reactions'));
    const parsedData = JSON.parse(localStorageData!);
    expect(parsedData[reviewId!]).toBe('photos');
    
    // Count entries for this reviewId (should be exactly 1)
    const entriesForReview = Object.entries(parsedData).filter(([key]) => key === reviewId);
    expect(entriesForReview.length).toBe(1);
  });
});