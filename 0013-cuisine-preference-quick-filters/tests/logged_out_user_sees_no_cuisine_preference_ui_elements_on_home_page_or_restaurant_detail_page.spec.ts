import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = 'dc553a2b-ac48-4126-964b-bd95e45e5670';

test('Logged-out user sees no cuisine preference UI elements on home page or restaurant detail page', async ({ page }) => {
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => {
    localStorage.setItem('deld-cuisine-prefs-user_0001', JSON.stringify({
      cuisines: ['italian', 'thai', 'japanese'],
      updatedAt: '2024-01-15T14:20:00.000Z'
    }));
  });

  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('cuisine-quick-filters')).toHaveCount(0);
  await expect(page.getByTestId('setup-cuisines-btn')).toHaveCount(0);
  await expect(page.getByTestId('customize-cuisines-btn')).toHaveCount(0);
  expect(await page.locator('[data-testid^="cuisine-chip-"]').count()).toBe(0);

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('matches-your-taste-badge')).toHaveCount(0);
  expect(await page.locator('[data-testid^="matched-cuisine-"]').count()).toBe(0);
});