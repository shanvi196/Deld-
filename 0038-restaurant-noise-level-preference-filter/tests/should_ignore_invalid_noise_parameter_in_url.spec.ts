import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Noise Level Filter - Invalid URL Parameter', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should ignore invalid noise parameter in URL', async ({ page }) => {
    await page.goto('http://localhost:3000?noise=invalid-value');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const quietRadio = page.getByTestId('noise-filter-quiet');
    const moderateRadio = page.getByTestId('noise-filter-moderate');
    const livelyRadio = page.getByTestId('noise-filter-lively');

    await expect(quietRadio).not.toBeChecked();
    await expect(moderateRadio).not.toBeChecked();
    await expect(livelyRadio).not.toBeChecked();

    await expect(homePage.restaurantCards.first()).toBeVisible();
  });
});