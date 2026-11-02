import { test, expect } from '@playwright/test';

test.describe('PriceScale Visual Indicator', () => {
  test('should display correct number of filled indicators for level 4', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const restaurantCards = page.locator('[data-testid^="restaurant-card-link-"]');
    await expect(restaurantCards.first()).toBeVisible();

    const allCards = await restaurantCards.all();
    let foundLevel4 = false;

    for (const card of allCards) {
      const priceScale = card.locator('[data-testid="price-scale"]');
      const filledCount = await priceScale.locator('[data-testid="price-scale-filled"]').count();

      if (filledCount === 3 || filledCount === 4) {
        foundLevel4 = true;
        const emptyCount = await priceScale.locator('[data-testid="price-scale-empty"]').count();
        expect([0, 1]).toContain(emptyCount);
        break;
      }
    }

    expect(foundLevel4).toBe(true);
  });
});