import { test, expect } from '@playwright/test';

test('Copy Link action copies restaurant URL to clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);

  const firstCard = page.locator('[data-testid="restaurant-card"]').first();
  const restaurantId = await firstCard.getAttribute('data-restaurant-id');

  const menuButton = firstCard.locator('[data-testid="quick-actions-menu-trigger"]');
  await menuButton.click();

  const menu = page.locator('[data-testid="quick-actions-menu"]');
  await expect(menu).toBeVisible();

  const copyLinkOption = menu.locator('[role="menuitem"]', { hasText: 'Copy Link' });
  await copyLinkOption.click();

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toContain(`/restaurant/${restaurantId}`);

  const toast = page.locator('[role="status"]', { hasText: 'Link copied to clipboard' });
  await expect(toast).toBeVisible();
});
