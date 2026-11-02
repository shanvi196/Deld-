import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Reaction Emoji System - Toggle Reaction', () => {
  test('should toggle reaction on button click', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Scroll to reviews section
    const reviewsSection = page.getByTestId('recommended-reviews-section');
    await reviewsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Find the first review's helpful reaction button
    const helpfulButton = page.locator('[data-testid^="reaction-btn-helpful-"]').first();
    await expect(helpfulButton).toBeVisible();

    // Get initial count
    const reviewId = await helpfulButton.getAttribute('data-testid').then(id => id?.replace('reaction-btn-helpful-', ''));
    const countLocator = page.getByTestId(`reaction-count-helpful-${reviewId}`);
    const initialCountText = await countLocator.textContent();
    const initialCount = parseInt(initialCountText || '0', 10);

    // Click the helpful reaction button
    await helpfulButton.click();
    await page.waitForTimeout(500);

    // Button should have aria-pressed="true" to indicate active state
    await expect(helpfulButton).toHaveAttribute('aria-pressed', 'true');

    // The reaction count should increase by 1
    const newCountText = await countLocator.textContent();
    const newCount = parseInt(newCountText || '0', 10);
    expect(newCount).toBe(initialCount + 1);

    // Click the same button again to toggle off
    await helpfulButton.click();
    await page.waitForTimeout(500);

    // Button should have aria-pressed="false" to indicate inactive state
    await expect(helpfulButton).toHaveAttribute('aria-pressed', 'false');

    // The count should decrease back
    const finalCountText = await countLocator.textContent();
    const finalCount = parseInt(finalCountText || '0', 10);
    expect(finalCount).toBe(initialCount);
  });
});