import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Comparison - Modal Display', () => {
  test('comparison modal displays reviews in side-by-side columns', async ({ page }) => {
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

    const compareButton = page.getByTestId('compare-selected-button');
    await expect(compareButton).toBeEnabled();
    await compareButton.click();
    await page.waitForTimeout(500);

    const modal = page.getByTestId('review-comparison-modal');
    await expect(modal).toBeVisible();

    const column0 = page.getByTestId('comparison-review-column-0');
    const column1 = page.getByTestId('comparison-review-column-1');
    await expect(column0).toBeVisible();
    await expect(column1).toBeVisible();

    const closeButton = page.getByTestId('comparison-modal-close');
    await expect(closeButton).toBeVisible();
  });
});