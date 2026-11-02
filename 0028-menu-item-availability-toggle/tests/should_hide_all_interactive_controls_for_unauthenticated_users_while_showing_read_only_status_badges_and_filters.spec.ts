import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('should hide all interactive controls for unauthenticated users while showing read-only status badges and filters', async ({ page }) => {
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('menu-items-section')).toBeVisible();

  const menuItemCards = page.locator('[data-testid^="menu-item-card-"]');
  const cardCount = await menuItemCards.count();
  expect(cardCount).toBeGreaterThanOrEqual(3);

  const availableBadges = page.getByTestId('status-badge-available');
  expect(await availableBadges.count()).toBe(cardCount);

  const dropdownTriggers = page.locator('[data-testid^="status-dropdown-trigger-"]');
  expect(await dropdownTriggers.count()).toBe(0);

  await expect(page.getByTestId('reset-all-button')).toHaveCount(0);

  await expect(page.getByTestId('status-filter-bar')).toBeVisible();

  const allChip = page.getByTestId('filter-chip-all');
  await expect(allChip).toBeVisible();
  await expect(allChip).toHaveAttribute('aria-pressed', 'true');

  await expect(page.getByTestId('filter-chip-available')).toContainText(`Available (${cardCount})`);

  await page.getByTestId('filter-chip-available').click();
  await page.waitForTimeout(500);

  const visibleCards = page.locator('[data-testid^="menu-item-card-"]');
  expect(await visibleCards.count()).toBe(cardCount);
});