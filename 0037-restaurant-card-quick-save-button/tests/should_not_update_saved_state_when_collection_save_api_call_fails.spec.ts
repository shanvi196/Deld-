import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';

test.describe('Error State - API Failure', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
    await page.waitForTimeout(1000);
  });

  test('should not update saved state when collection save api call fails', async ({ page, context }) => {
    const cookies = await context.cookies();
    const userCookie = cookies.find(c => c.name === 'user');
    expect(userCookie).toBeDefined();
    const userId = userCookie!.value;

    await homePage.expectRestaurantCardsToBeVisible();

    const firstCard = page.locator('[data-testid^="restaurant-card-link-"]').first();
    const firstCardTestId = await firstCard.getAttribute('data-testid');
    const existingId = firstCardTestId?.replace('restaurant-card-link-', '') ?? '';

    await firstCard.hover();
    await page.waitForTimeout(500);
    const existingBtn = page.getByTestId(`quick-save-button-${existingId}`);
    await existingBtn.click();
    await page.waitForTimeout(500);

    const saveDialog = page.getByTestId('save-to-collection-dialog');
    await expect(saveDialog).toBeVisible();
    const checkboxes = saveDialog.locator('[role="checkbox"], input[type="checkbox"]');
    await checkboxes.first().click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    await expect(page.getByTestId('saved-count-badge')).toHaveText('1');
    await expect(page.getByTestId('recently-saved-section')).toBeVisible();
    await expect(page.getByTestId(`recently-saved-card-${existingId}`)).toBeVisible();

    const secondCard = page.locator('[data-testid^="restaurant-card-link-"]').nth(1);
    const secondCardTestId = await secondCard.getAttribute('data-testid');
    const failId = secondCardTestId?.replace('restaurant-card-link-', '') ?? '';

    await secondCard.hover();
    await page.waitForTimeout(500);
    const failBtn = page.getByTestId(`quick-save-button-${failId}`);
    const failSvgClass = await failBtn.locator('svg').getAttribute('class');
    expect(failSvgClass ?? '').not.toContain('fill-current');

    await page.route(/\/api\/collections\/[^/]+\/items/, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Internal Server Error' })
        });
      } else {
        await route.continue();
      }
    });

    await failBtn.click();
    await page.waitForTimeout(500);

    const failDialog = page.getByTestId('save-to-collection-dialog');
    await expect(failDialog).toBeVisible();
    const failCheckboxes = failDialog.locator('[role="checkbox"], input[type="checkbox"]');
    await failCheckboxes.first().click();
    await page.waitForTimeout(1000);

    await expect(failDialog.getByText(/failed to save|something went wrong|error/i)).toBeVisible({ timeout: 5000 });

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    await page.unroute(/\/api\/collections\/[^/]+\/items/);

    await secondCard.hover();
    await page.waitForTimeout(500);
    const afterFailClass = await failBtn.locator('svg').getAttribute('class');
    expect(afterFailClass ?? '').not.toContain('fill-current');

    await expect(page.getByTestId('saved-count-badge')).toHaveText('1');
    await expect(page.getByTestId(`recently-saved-card-${existingId}`)).toBeVisible();

    const localStorageKey = `deld-recently-saved-${userId}`;
    const storedData = await page.evaluate((key) => localStorage.getItem(key), localStorageKey);
    const parsedData = JSON.parse(storedData!);
    expect(parsedData.length).toBe(1);
    expect(parsedData[0].restaurantId).toBe(existingId);
  });
});