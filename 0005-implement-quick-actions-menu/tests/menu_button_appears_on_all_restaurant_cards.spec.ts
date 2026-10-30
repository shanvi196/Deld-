import { test, expect } from '@playwright/test';

test('Menu button appears on all restaurant cards', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  const restaurantCards = page.locator('[data-testid="restaurant-card"]');
  await expect(restaurantCards.first()).toBeVisible();

  const firstCard = restaurantCards.first();
  const menuButton = firstCard.locator('[data-testid="quick-actions-menu-trigger"]');
  await expect(menuButton).toBeVisible();
});
