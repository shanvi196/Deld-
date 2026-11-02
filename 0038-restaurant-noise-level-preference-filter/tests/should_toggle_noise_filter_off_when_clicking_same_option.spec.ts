import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Noise Level Filter - Toggle Off', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should toggle noise filter off when clicking same option', async ({ page }) => {
    await page.goto('http://localhost:3000?noise=moderate');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const moderateRadio = page.getByTestId('noise-filter-moderate');
    await expect(moderateRadio).toBeChecked();

    await moderateRadio.click();

    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).not.toContain('noise=lively');
    await expect(moderateRadio).toBeChecked();
  });
});