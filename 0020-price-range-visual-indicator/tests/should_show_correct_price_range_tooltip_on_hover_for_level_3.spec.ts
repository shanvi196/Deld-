import { test, expect } from '@playwright/test';

test.describe('PriceScale Tooltip', () => {
  test('should show correct price range tooltip on hover for level 3', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const restaurantCards = page.locator('[data-testid^="restaurant-card-link-"]');
    await expect(restaurantCards.first()).toBeVisible();

    const allCards = await restaurantCards.all();
    let foundLevel3 = false;

    for (const card of allCards) {
      const priceScale = card.locator('[data-testid="price-scale"]');
      const filledCount = await priceScale.locator('[data-testid="price-scale-filled"]').count();

      if (filledCount === 3) {
        foundLevel3 = true;
        await priceScale.hover();
        await page.waitForTimeout(500);

        const tooltip = page.locator('[data-testid="price-scale-tooltip"]');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('$30-$60');
        break;
      }
    }

    expect(foundLevel3).toBe(true);
  });
});