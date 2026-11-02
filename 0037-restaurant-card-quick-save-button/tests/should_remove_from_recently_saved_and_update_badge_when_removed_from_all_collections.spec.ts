import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';

test.describe('Recently Saved - Remove and Update Badge', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
    await page.waitForTimeout(1000);
  });

  test('should remove from recently saved and update badge when removed from all collections', async ({ page, context }) => {
    await homePage.expectRestaurantCardsToBeVisible();

    const savedRestaurantIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const card = page.locator('[data-testid^="restaurant-card-link-"]').nth(i);
      const cardTestId = await card.getAttribute('data-testid');
      const restaurantId = cardTestId?.replace('restaurant-card-link-', '') ?? '';
      savedRestaurantIds.push(restaurantId);

      await card.hover();
      await page.waitForTimeout(500);

      const quickSaveBtn = page.getByTestId(`quick-save-button-${restaurantId}`);
      await quickSaveBtn.click();
      await page.waitForTimeout(500);

      const saveDialog = page.getByTestId('save-to-collection-dialog');
      await expect(saveDialog).toBeVisible();
      const checkboxes = saveDialog.locator('[role="checkbox"], input[type="checkbox"]');
      await checkboxes.first().click();
      await page.waitForTimeout(500);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    const badge = page.getByTestId('saved-count-badge');
    await expect(badge).toHaveText('3');

    await expect(page.getByTestId('recently-saved-section')).toBeVisible();

    const targetId = savedRestaurantIds[0];
    await expect(page.getByTestId(`recently-saved-card-${targetId}`)).toBeVisible();

    const targetCard = page.locator(`[data-testid="restaurant-card-link-${targetId}"]`);
    await targetCard.hover();
    await page.waitForTimeout(500);

    const targetQuickSaveBtn = page.getByTestId(`quick-save-button-${targetId}`);
    await targetQuickSaveBtn.click();
    await page.waitForTimeout(500);

    const saveDialog = page.getByTestId('save-to-collection-dialog');
    await expect(saveDialog).toBeVisible();
    const checkedCheckboxes = saveDialog.locator('[role="checkbox"][data-state="checked"], input[type="checkbox"]:checked');
    await checkedCheckboxes.first().click();
    await page.waitForTimeout(500);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    await targetCard.hover();
    await page.waitForTimeout(500);
    const svgClass = await targetQuickSaveBtn.locator('svg').getAttribute('class');
    expect(svgClass ?? '').not.toContain('fill-current');

    await expect(page.getByTestId(`recently-saved-card-${targetId}`)).not.toBeVisible();

    await expect(badge).toHaveText('2');

    const cookies = await context.cookies();
    const userCookie = cookies.find(c => c.name === 'user');
    const userData = JSON.parse(decodeURIComponent(userCookie!.value));
    const userId = userData.id;
    const localStorageKey = `deld-recently-saved-${userId}`;
    const storedData = await page.evaluate((key) => localStorage.getItem(key), localStorageKey);
    expect(storedData).not.toBeNull();
    const parsedData = JSON.parse(storedData!);
    const hasRemoved = parsedData.some((entry: { restaurantId: string }) => entry.restaurantId === targetId);
    expect(hasRemoved).toBe(false);
  });
});