import { test, expect } from '@playwright/test';

test('Multiple menus can open independently without affecting each other', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  const restaurantCards = page.locator('[data-testid="restaurant-card"]');
  await expect(restaurantCards).toHaveCount(await restaurantCards.count());
  const cardCount = await restaurantCards.count();
  expect(cardCount).toBeGreaterThanOrEqual(2);

  const firstCard = restaurantCards.nth(0);
  const firstMenuButton = firstCard.locator('[data-testid="quick-actions-menu-trigger"]');
  await firstMenuButton.click();

  const firstMenu = page.locator('[data-testid="quick-actions-menu"]').first();
  await expect(firstMenu).toBeVisible();

  const secondCard = restaurantCards.nth(1);
  const secondMenuButton = secondCard.locator('[data-testid="quick-actions-menu-trigger"]');
  await secondMenuButton.click();

  const visibleMenus = page.locator('[data-testid="quick-actions-menu"]');
  await expect(visibleMenus).toHaveCount(1);

  const secondMenu = visibleMenus.first();
  const menuItems = secondMenu.locator('[role="menuitem"]');
  await expect(menuItems).toHaveCount(3);
});
