import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Noise Level Filter - Persistence with Other Filters', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should persist noise filter with other filters applied', async ({ page }) => {
    await page.goto('http://localhost:3000?distance=driving-5mi&categories=italian');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const quietRadio = page.getByTestId('noise-filter-quiet');
    await quietRadio.click();

    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toContain('noise=quiet');
    expect(url).toContain('distance=driving-5mi');
    expect(url).toContain('categories=italian');

    await homePage.expectAppliedFiltersToBeVisible();
    await homePage.expectFiltersCount(3);
  });
});