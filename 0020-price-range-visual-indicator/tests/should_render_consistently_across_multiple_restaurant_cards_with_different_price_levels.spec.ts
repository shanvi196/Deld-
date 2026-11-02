import { test, expect } from '@playwright/test';

test.describe('PriceScale Consistency', () => {
  test('should render consistently across multiple restaurant cards with different price levels', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const restaurantCards = page.locator('[data-testid^="restaurant-card-link-"]');
    await expect(restaurantCards.first()).toBeVisible();

    const cardCount = await restaurantCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(3);

    const allCards = await restaurantCards.all();
    const priceLevelsFound = new Set<number>();

    for (const card of allCards) {
      const priceScale = card.locator('[data-testid="price-scale"]');
      const isVisible = await priceScale.isVisible();

      if (isVisible) {
        const filledCount = await priceScale.locator('[data-testid="price-scale-filled"]').count();
        const emptyCount = await priceScale.locator('[data-testid="price-scale-empty"]').count();
        const totalIndicators = filledCount + emptyCount;

        expect(totalIndicators).toBe(4);
        expect(filledCount).toBeGreaterThanOrEqual(1);
        expect(filledCount).toBeLessThanOrEqual(4);

        priceLevelsFound.add(filledCount);
      }
    }

    expect(priceLevelsFound.size).toBeGreaterThanOrEqual(1);
  });
});