import { test, expect } from '@playwright/test';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Corrupted localStorage Handling', () => {
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    restaurantDetailsPage = new RestaurantDetailsPage(page);
  });

  test('should gracefully default to available status when localStorage is corrupted', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
     await page.evaluate(() => {
      localStorage.setItem('menuItemStatus', '{malformed');
    });

    await page.reload();
    await restaurantDetailsPage.waitForPageLoad();

    // const menuItemsSection = page.locator('[data-testid="menu-items-section"]');
    // await menuItemsSection.scrollIntoViewIfNeeded();

    const firstMenuItemCard = page.locator('[data-testid^="menu-item-card-"]').first();
    const statusBadge = firstMenuItemCard.locator('[data-testid="status-badge-available"]');
    await expect(statusBadge).toBeVisible({ timeout: 5000 });

    const jsonParseErrors = consoleErrors.filter(err => 
      err.toLowerCase().includes('json') || 
      err.toLowerCase().includes('parse') ||
      err.toLowerCase().includes('syntaxerror')
    );
    expect(jsonParseErrors.length).toBe(0);
  });
});