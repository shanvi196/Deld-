import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Map Marker Style Persistence', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should persist marker style after page reload', async ({ page }) => {
    await homePage.goto();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      localStorage.setItem('deld-map-preferences', JSON.stringify({ markerStyle: 'circle', showLabels: false }));
    });

    await homePage.goto();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const circleStyleButton = page.getByTestId('marker-style-circle');
    const pinStyleButton = page.getByTestId('marker-style-pin');

    const circleButtonClass = await circleStyleButton.getAttribute('class');
    expect(circleButtonClass).toMatch(/active|selected|bg-primary|pressed/);

    const pinButtonClass = await pinStyleButton.getAttribute('class');
    expect(pinButtonClass).not.toMatch(/active|selected|bg-primary|pressed/);
  });
});