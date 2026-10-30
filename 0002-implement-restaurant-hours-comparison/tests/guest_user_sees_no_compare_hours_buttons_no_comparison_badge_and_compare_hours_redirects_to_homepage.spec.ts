import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test('Guest user sees no compare-hours buttons, no comparison badge, and /compare-hours redirects to homepage', async ({ page }) => {
  const homePage = new HomePage(page);

  await page.goto('http://localhost:3000');
  await page.evaluate(() => localStorage.removeItem('hoursComparison'));
  await homePage.goto();

  const cardCount = await homePage.restaurantCards.count();
  expect(cardCount).toBeGreaterThanOrEqual(5);

  const compareButtons = page.locator('[data-testid^="compare-hours-button-"]');
  expect(await compareButtons.count()).toBe(0);

  await expect(page.getByTestId('comparison-badge')).not.toBeVisible();
  await expect(page.getByTestId('hours-comparison-sidebar')).not.toBeVisible();

  const restaurantId = await homePage.getRestaurantIdFromCard(0);
  await page.goto(`http://localhost:3000/restaurants/${restaurantId}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  expect(page.url()).toContain('/restaurants/');

  await expect(page.getByTestId('compare-hours-action-button')).not.toBeVisible();
  await expect(page.getByTestId('comparison-badge')).not.toBeVisible();

  await page.goto('http://localhost:3000/compare-hours');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const currentUrl = page.url();
  expect(currentUrl === 'http://localhost:3000/' || currentUrl === 'http://localhost:3000').toBeTruthy();

  await expect(page.getByTestId('compare-hours-page')).not.toBeVisible();
});