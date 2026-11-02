import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Noise Level Filter - Select Quiet', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should select quiet noise level filter and update URL', async ({ page }) => {
    const noiseFilter = page.getByTestId('noise-filter');
    await expect(noiseFilter).toBeVisible();

    const quietRadio = page.getByTestId('noise-filter-quiet');
    await quietRadio.click();

    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/noise=quiet/);
    await expect(quietRadio).toBeChecked();

    await expect(homePage.restaurantCards.first()).toBeVisible();
  });
});