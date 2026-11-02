import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';

test.describe('Recently Saved - First Save Initialization', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
    await page.waitForTimeout(1000);
  });

  test('should initialize all derived state when saving first restaurant via quick save', async ({ page, context }) => {
    const cookies = await context.cookies();
    const userCookie = cookies.find(c => c.name === 'user');
    expect(userCookie).toBeDefined();
    const userId = userCookie!.value;

    await expect(page.getByTestId('recently-saved-section')).not.toBeVisible();
    await expect(page.getByTestId('saved-count-badge')).not.toBeVisible();

    await homePage.expectRestaurantCardsToBeVisible();
    const firstCard = page.locator('[data-testid^="restaurant-card-link-"]').first();
    const firstCardTestId = await firstCard.getAttribute('data-testid');
    const restaurantId = firstCardTestId?.replace('restaurant-card-link-', '');

    await firstCard.hover();
    await page.waitForTimeout(500);
    const quickSaveButton = page.getByTestId(`quick-save-button-${restaurantId}`);
    await expect(quickSaveButton).toBeVisible();
    const svgBefore = await quickSaveButton.locator('svg').getAttribute('class');
    expect(svgBefore ?? '').not.toContain('fill-current');

    await quickSaveButton.click();
    await page.waitForTimeout(500);

    const saveDialog = page.getByTestId('save-to-collection-dialog');
    await expect(saveDialog).toBeVisible();
    const checkboxes = saveDialog.locator('[role="checkbox"], input[type="checkbox"]');
    await checkboxes.first().click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    await firstCard.hover();
    await page.waitForTimeout(500);
    const svgAfter = await quickSaveButton.locator('svg').getAttribute('class');
    expect(svgAfter).toContain('fill-current');

    await expect(page.getByTestId('recently-saved-section')).toBeVisible();
    await expect(page.getByTestId('recently-saved-heading')).toBeVisible();

    await expect(page.getByTestId(`recently-saved-card-${restaurantId}`)).toBeVisible();

    await expect(page.getByTestId('saved-count-badge')).toHaveText('1');

    const localStorageKey = `deld-recently-saved-${userId}`;
    const storedData = await page.evaluate((key) => localStorage.getItem(key), localStorageKey);
    expect(storedData).not.toBeNull();
    const parsedData = JSON.parse(storedData!);
    expect(parsedData.length).toBe(1);
    expect(parsedData[0].restaurantId).toBe(restaurantId);
    expect(parsedData[0].savedAt).toBeTruthy();
    expect(parsedData[0].savedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});