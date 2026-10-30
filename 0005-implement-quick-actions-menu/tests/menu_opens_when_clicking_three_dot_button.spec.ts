import { test, expect } from '@playwright/test';

test('Menu opens when clicking three-dot button', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  const firstCard = page.locator('[data-testid="restaurant-card"]').first();
  const menuButton = firstCard.locator('[data-testid="quick-actions-menu-trigger"]');
  await menuButton.click();

  const menu = page.locator('[data-testid="quick-actions-menu"]');
  await expect(menu).toBeVisible();

  const menuItems = menu.locator('[role="menuitem"]');
  await expect(menuItems).toHaveCount(3);
});
