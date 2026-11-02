import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Map Default State', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should show pin style active and labels disabled by default when no localStorage', async ({ page }) => {
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
    const toggleLabelsButton = page.getByTestId('toggle-labels-button');

    const pinButtonClass = await pinStyleButton.getAttribute('class');
    expect(pinButtonClass).toMatch(/active|selected|bg-primary|pressed/);

    const toggleButtonClass = await toggleLabelsButton.getAttribute('class');
    expect(toggleButtonClass).not.toMatch(/active|selected|bg-primary|pressed|enabled/);
  });
});