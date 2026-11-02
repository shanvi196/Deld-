import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Auth Gating - Guest User', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should hide all auth gated features for guest user and redirect on quick save click', async ({ page }) => {
    await homePage.expectRestaurantCardsToBeVisible();

    const cardCount = await page.locator('[data-testid^="restaurant-card-link-"]').count();
    expect(cardCount).toBeGreaterThanOrEqual(5);

    await expect(page.getByTestId('recently-saved-section')).not.toBeVisible();

    await expect(page.getByTestId('saved-count-badge')).not.toBeVisible();

    const firstCard = page.locator('[data-testid^="restaurant-card-link-"]').first();
    const firstCardTestId = await firstCard.getAttribute('data-testid');
    const restaurantId = firstCardTestId?.replace('restaurant-card-link-', '');

    await firstCard.hover();
    await page.waitForTimeout(500);

    const quickSaveButton = page.getByTestId(`quick-save-button-${restaurantId}`);
    await expect(quickSaveButton).toBeVisible();

    const svgClass = await quickSaveButton.locator('svg').getAttribute('class');
    expect(svgClass ?? '').not.toContain('fill-current');

    await quickSaveButton.click();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('save-to-collection-dialog')).not.toBeVisible();

    expect(page.url()).toContain('/login');

    const recentlySavedKeys = await page.evaluate(() => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('deld-recently-saved-')) {
          keys.push(key);
        }
      }
      return keys;
    });
    expect(recentlySavedKeys.length).toBe(0);
  });
});