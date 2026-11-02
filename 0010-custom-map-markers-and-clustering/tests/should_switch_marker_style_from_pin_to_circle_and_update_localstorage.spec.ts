import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Map Marker Style Switching', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should switch marker style from pin to circle and update localStorage', async ({ page }) => {
    await homePage.goto();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => localStorage.removeItem('deld-map-preferences'));
    await homePage.goto();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const pinStyleButton = page.getByTestId('marker-style-pin');
    const circleStyleButton = page.getByTestId('marker-style-circle');

    const pinButtonClass = await pinStyleButton.getAttribute('class');
    expect(pinButtonClass).toMatch(/active|selected|bg-primary|pressed/);

    await circleStyleButton.click();
    await page.waitForTimeout(500);

    const circleButtonClassAfter = await circleStyleButton.getAttribute('class');
    expect(circleButtonClassAfter).toMatch(/active|selected|bg-primary|pressed/);

    const pinButtonClassAfter = await pinStyleButton.getAttribute('class');
    expect(pinButtonClassAfter).not.toMatch(/active|selected|bg-primary|pressed/);

    const storedPrefs = await page.evaluate(() => {
      const stored = localStorage.getItem('deld-map-preferences');
      return stored ? JSON.parse(stored) : null;
    });
    expect(storedPrefs).toBeTruthy();
    expect(storedPrefs.markerStyle).toBe('circle');
  });
});