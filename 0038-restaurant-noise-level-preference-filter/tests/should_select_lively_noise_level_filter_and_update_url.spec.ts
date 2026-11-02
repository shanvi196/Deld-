import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Noise Level Filter - Select Lively', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should select lively noise level filter and update URL', async ({ page }) => {
    const noiseFilter = page.getByTestId('noise-filter');
    await expect(noiseFilter).toBeVisible();

    const livelyRadio = page.getByTestId('noise-filter-lively');
    await livelyRadio.click();

    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/noise=lively/);
    await expect(livelyRadio).toHaveAttribute('aria-checked', 'true');
  });
});