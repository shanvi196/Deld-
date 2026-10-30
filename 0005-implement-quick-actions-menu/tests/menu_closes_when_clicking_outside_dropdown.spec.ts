import { test, expect } from '@playwright/test';

test('Menu closes when clicking outside dropdown', async ({ page }) => {
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

  await page.locator('body').click({ position: { x: 10, y: 10 } });

  await expect(menu).not.toBeVisible();
});
