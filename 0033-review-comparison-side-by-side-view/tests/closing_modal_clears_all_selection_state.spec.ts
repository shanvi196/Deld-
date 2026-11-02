import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Comparison - Modal Close Clears Selection', () => {
  test('closing modal clears all selection state', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const reviewsSection = page.getByTestId('recommended-reviews-section');
    await reviewsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const reviewCheckboxes = page.getByTestId(/review-select-checkbox-/);
    await expect(reviewCheckboxes.first()).toBeVisible();

    await reviewCheckboxes.nth(0).click();
    await page.waitForTimeout(300);
    await reviewCheckboxes.nth(1).click();
    await page.waitForTimeout(300);

    await expect(reviewCheckboxes.nth(0)).toBeChecked();
    await expect(reviewCheckboxes.nth(1)).toBeChecked();

    const compareButton = page.getByTestId('compare-selected-button');
    await compareButton.click();
    await page.waitForTimeout(500);

    const modal = page.getByTestId('review-comparison-modal');
    await expect(modal).toBeVisible();

    const closeButton = page.getByTestId('comparison-modal-close');
    await closeButton.click();
    await page.waitForTimeout(500);

    await expect(modal).not.toBeVisible();
    await expect(reviewCheckboxes.nth(0)).not.toBeChecked();
    await expect(reviewCheckboxes.nth(1)).not.toBeChecked();
    await expect(compareButton).not.toBeVisible();
  });
});