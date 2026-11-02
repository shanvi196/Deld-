import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Comparison - Selection Persistence', () => {
  test('selection state persists when scrolling', async ({ page }) => {
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
    await reviewCheckboxes.nth(2).click();
    await page.waitForTimeout(300);

    const compareButton = page.getByTestId('compare-selected-button');
    await expect(compareButton).toContainText('Compare (2)');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    await reviewsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await expect(reviewCheckboxes.nth(0)).toBeChecked();
    await expect(reviewCheckboxes.nth(2)).toBeChecked();
    await expect(compareButton).toContainText('Compare (2)');
  });
});