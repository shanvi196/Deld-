import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';

test.describe('Recently Saved - User Isolation', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
    await page.waitForTimeout(1000);
  });

  test('should isolate recently saved data between different user accounts', async ({ page, context }) => {
    const cookies = await context.cookies();
    const userCookie = cookies.find(c => c.name === 'user');
    expect(userCookie).toBeDefined();
    const userId = userCookie!.value;

    await homePage.expectRestaurantCardsToBeVisible();
    const firstCard = page.locator('[data-testid^="restaurant-card-link-"]').first();
    const firstCardTestId = await firstCard.getAttribute('data-testid');
    const restaurantId = firstCardTestId?.replace('restaurant-card-link-', '');

    await firstCard.hover();
    await page.waitForTimeout(500);
    const quickSaveButton = page.getByTestId(`quick-save-button-${restaurantId}`);
    await quickSaveButton.click();
    await page.waitForTimeout(500);

    const saveDialog = page.getByTestId('save-to-collection-dialog');
    await expect(saveDialog).toBeVisible();
    const checkboxes = saveDialog.locator('[role="checkbox"], input[type="checkbox"]');
    await checkboxes.first().click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const localStorageKey = `deld-recently-saved-${userId}`;
    const storedData = await page.evaluate((key) => localStorage.getItem(key), localStorageKey);
    expect(storedData).not.toBeNull();
    const parsedData = JSON.parse(storedData!);
    expect(parsedData.length).toBe(1);
    expect(parsedData[0].restaurantId).toBe(restaurantId);

    await expect(page.getByTestId('recently-saved-section')).toBeVisible();
    await expect(page.getByTestId('saved-count-badge')).toBeVisible();

    await homePage.topBar.openUserMenu();
    await homePage.topBar.userAvatarMenuLogout.click();
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');

    await homePage.goto();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('recently-saved-section')).not.toBeVisible();
    await expect(page.getByTestId('saved-count-badge')).not.toBeVisible();

    const dataAfterLogout = await page.evaluate((key) => localStorage.getItem(key), localStorageKey);
    expect(dataAfterLogout).not.toBeNull();
    const parsedAfterLogout = JSON.parse(dataAfterLogout!);
    expect(parsedAfterLogout.length).toBe(1);

    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('recently-saved-section')).toBeVisible();
    await expect(page.getByTestId(`recently-saved-card-${restaurantId}`)).toBeVisible();
    await expect(page.getByTestId('saved-count-badge')).toBeVisible();
  });
});