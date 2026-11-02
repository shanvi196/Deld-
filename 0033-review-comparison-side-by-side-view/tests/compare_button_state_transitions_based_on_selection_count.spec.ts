import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Comparison - Compare Button State Transitions', () => {
  test('compare button state transitions based on selection count', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const reviewsSection = page.getByTestId('recommended-reviews-section');
    await reviewsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const reviewCheckboxes = page.getByTestId(/review-select-checkbox-/);
    await expect(reviewCheckboxes.first()).toBeVisible();
    const checkboxCount = await reviewCheckboxes.count();
    expect(checkboxCount).toBeGreaterThanOrEqual(4);

    const compareButton = page.getByTestId('compare-selected-button');
    await expect(compareButton).not.toBeVisible();

    await reviewCheckboxes.nth(0).click();
    await page.waitForTimeout(300);
    await expect(compareButton).toBeVisible();
    await expect(compareButton).toBeDisabled();
    await expect(compareButton).toContainText('Compare (1)');

    await reviewCheckboxes.nth(1).click();
    await page.waitForTimeout(300);
    await expect(compareButton).toBeEnabled();
    await expect(compareButton).toContainText('Compare (2)');

    await reviewCheckboxes.nth(2).click();
    await page.waitForTimeout(300);
    await expect(compareButton).toBeEnabled();
    await expect(compareButton).toContainText('Compare (3)');

    await expect(reviewCheckboxes.nth(3)).not.toBeEnabled();
 
  });
});