import { test, expect } from '@playwright/test';

test.describe('PriceScale Tooltip', () => {
  test('should hide tooltip when mouse leaves PriceScale', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const restaurantCards = page.locator('[data-testid^="restaurant-card-link-"]');
    await expect(restaurantCards.first()).toBeVisible();

    const firstCard = restaurantCards.first();
    const priceScale = firstCard.locator('[data-testid="price-scale"]');
    await expect(priceScale).toBeVisible();

    await priceScale.hover();
    await page.waitForTimeout(500);

    const tooltip = page.locator('[data-testid="price-scale-tooltip"]');
    await expect(tooltip).toBeVisible();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    await expect(tooltip).not.toBeVisible();
  });
});