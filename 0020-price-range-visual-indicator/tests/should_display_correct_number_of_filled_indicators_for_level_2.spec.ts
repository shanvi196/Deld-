import { test, expect } from '@playwright/test';

test.describe('PriceScale Visual Indicator', () => {
  test('should display correct number of filled indicators for level 2', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const restaurantCards = page.locator('[data-testid^="restaurant-card-link-"]');
    await expect(restaurantCards.first()).toBeVisible();

    const priceScales = page.locator('[data-testid="price-scale"]');
    await expect(priceScales.first()).toBeVisible();

    const allCards = await restaurantCards.all();
    let foundLevel2 = false;

    for (const card of allCards) {
      const priceScale = card.locator('[data-testid="price-scale"]');
      const filledCount = await priceScale.locator('[data-testid="price-scale-filled"]').count();

      if (filledCount === 2) {
        foundLevel2 = true;
        const emptyCount = await priceScale.locator('[data-testid="price-scale-empty"]').count();
        expect(emptyCount).toBe(2);
        break;
      }
    }

    expect(foundLevel2).toBe(true);
  });
});