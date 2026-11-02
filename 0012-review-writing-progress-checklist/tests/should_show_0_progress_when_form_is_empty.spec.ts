import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Progress bar shows 0% when form is empty', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test('should show 0% progress when form is empty', async ({ page }) => {
    await page.goto(`http://localhost:3000/write-review/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const progressBar = page.getByTestId('review-progress-bar');
    await expect(progressBar).toBeVisible();

    const progressFill = progressBar.getByTestId('review-progress-fill');
    await expect(progressFill).not.toBeVisible();

    const fillStyle = await progressFill.getAttribute('style');
    expect(fillStyle).toContain('width');
    expect(fillStyle).toMatch(/width:\s*0%/);

    await expect(page.getByText('0%')).toBeVisible();
  });
});