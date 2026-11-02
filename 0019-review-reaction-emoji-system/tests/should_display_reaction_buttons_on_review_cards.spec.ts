import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Reaction Emoji System - Display Reaction Buttons', () => {
  test('should display reaction buttons on review cards', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Scroll to reviews section
    const reviewsSection = page.getByTestId('recommended-reviews-section');
    await reviewsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Find reaction buttons container with data-testid matching "reaction-buttons-" prefix
    const reactionButtonsContainers = page.locator('[data-testid^="reaction-buttons-"]');
    await expect(reactionButtonsContainers.first()).toBeVisible();

    // Each reaction button row should contain exactly 4 emoji buttons
    const firstContainer = reactionButtonsContainers.first();
    const buttons = firstContainer.locator('button');
    await expect(buttons).toHaveCount(4);

    // The buttons should include specific emojis
    await expect(firstContainer).toContainText('👍');
    await expect(firstContainer).toContainText('😋');
    await expect(firstContainer).toContainText('📸');
    await expect(firstContainer).toContainText('💡');
  });
});