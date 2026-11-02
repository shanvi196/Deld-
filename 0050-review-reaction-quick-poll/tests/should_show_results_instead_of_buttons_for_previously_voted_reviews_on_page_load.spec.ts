import { test, expect } from '@playwright/test';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Review Reaction Quick Poll - Previously Voted Reviews', () => {
  test('should show results instead of buttons for previously voted reviews on page load', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(10000);

    const yesButtons = page.locator('[data-testid^="poll-yes-btn-"]');
    await expect(yesButtons.first()).toBeVisible();
    const testId = await yesButtons.first().getAttribute('data-testid');
    const reviewId = testId?.replace('poll-yes-btn-', '');
    expect(reviewId).toBeTruthy();

    await page.evaluate((id) => {
      const polls: Record<string, string> = {};
      polls[id] = 'yes';
      localStorage.setItem('review-polls', JSON.stringify(polls));
    }, reviewId!);

    await page.reload();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    await expect(page.locator(`[data-testid="poll-yes-btn-${reviewId}"]`)).not.toBeVisible();
    await expect(page.locator(`[data-testid="poll-no-btn-${reviewId}"]`)).not.toBeVisible();

    const resultElement = page.locator(`[data-testid="poll-result-${reviewId}"]`);
    await expect(resultElement).toBeVisible();
  });
});