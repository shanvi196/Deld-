import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Quick Save Button - Hover Visibility', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('quick save button appears on restaurant card hover', async ({ page }) => {
    await homePage.expectRestaurantCardsToBeVisible();

    const restaurantCards = page.locator('[data-testid^="restaurant-card-link-"]');
    await expect(restaurantCards).toHaveCount(10);

    const firstCard = restaurantCards.nth(0);
    const firstCardTestId = await firstCard.getAttribute('data-testid');
    const restaurantId = firstCardTestId?.replace('restaurant-card-link-', '');

    const quickSaveButton = page.getByTestId(`quick-save-button-${restaurantId}`);

    await expect(quickSaveButton).not.toBeVisible();

    await firstCard.hover();
    await page.waitForTimeout(500);

    await expect(quickSaveButton).toBeVisible();

    const buttonBounds = await quickSaveButton.boundingBox();
    const cardBounds = await firstCard.boundingBox();

    expect(buttonBounds).not.toBeNull();
    expect(cardBounds).not.toBeNull();

    if (buttonBounds && cardBounds) {
      const buttonRightEdge = buttonBounds.x + buttonBounds.width;
      const cardRightEdge = cardBounds.x + cardBounds.width;
      expect(buttonRightEdge).toBeLessThanOrEqual(cardRightEdge + 20);
      expect(buttonBounds.y).toBeLessThan(cardBounds.y + cardBounds.height / 2);
    }

    const bookmarkIcon = quickSaveButton.locator('svg');
    await expect(bookmarkIcon).toBeVisible();

    const secondCard = restaurantCards.nth(1);
    const secondCardTestId = await secondCard.getAttribute('data-testid');
    const secondRestaurantId = secondCardTestId?.replace('restaurant-card-link-', '');
    const secondQuickSaveButton = page.getByTestId(`quick-save-button-${secondRestaurantId}`);
    await expect(secondQuickSaveButton).not.toBeVisible();

    const thirdCard = restaurantCards.nth(2);
    const thirdCardTestId = await thirdCard.getAttribute('data-testid');
    const thirdRestaurantId = thirdCardTestId?.replace('restaurant-card-link-', '');
    const thirdQuickSaveButton = page.getByTestId(`quick-save-button-${thirdRestaurantId}`);
    await expect(thirdQuickSaveButton).not.toBeVisible();
  });
});