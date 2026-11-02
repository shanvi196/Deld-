import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('should persist all status changes across page navigation and restore them on return', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate(() => {
    localStorage.removeItem('deld-menu-availability-user_0001');
  });

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('menu-items-section')).toBeVisible();

  const menuItemCards = page.locator('[data-testid^="menu-item-card-"]');
  const cardCount = await menuItemCards.count();
  expect(cardCount).toBeGreaterThanOrEqual(3);

  const firstCardTestId = await menuItemCards.first().getAttribute('data-testid');
  const firstItemId = firstCardTestId!.replace('menu-item-card-', '');
  const secondCardTestId = await menuItemCards.nth(1).getAttribute('data-testid');
  const secondItemId = secondCardTestId!.replace('menu-item-card-', '');

  await page.getByTestId(`status-dropdown-trigger-${firstItemId}`).click();
  await page.waitForTimeout(500);
  await page.getByTestId('status-option-sold-out').click();
  await page.waitForTimeout(500);

  await page.getByTestId(`status-dropdown-trigger-${secondItemId}`).click();
  await page.waitForTimeout(500);
  await page.getByTestId('status-option-limited').click();
  await page.waitForTimeout(500);

  const firstItemCard = page.getByTestId(`menu-item-card-${firstItemId}`);
  await expect(firstItemCard.getByTestId('status-badge-sold-out')).toBeVisible();
  const secondItemCard = page.getByTestId(`menu-item-card-${secondItemId}`);
  await expect(secondItemCard.getByTestId('status-badge-limited')).toBeVisible();

  await homePage.goto();
  await page.waitForTimeout(1000);

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();
  await page.waitForTimeout(1000);

  const firstItemCardAfter = page.getByTestId(`menu-item-card-${firstItemId}`);
  await expect(firstItemCardAfter.getByTestId('status-badge-sold-out')).toBeVisible();
  const secondItemCardAfter = page.getByTestId(`menu-item-card-${secondItemId}`);
  await expect(secondItemCardAfter.getByTestId('status-badge-limited')).toBeVisible();

  await expect(page.getByTestId('sold-out-count-badge')).toContainText('1 Sold Out');
  await expect(page.getByTestId('filter-chip-sold-out')).toContainText('Sold Out (1)');
  await expect(page.getByTestId('filter-chip-limited')).toContainText('Limited (1)');
});