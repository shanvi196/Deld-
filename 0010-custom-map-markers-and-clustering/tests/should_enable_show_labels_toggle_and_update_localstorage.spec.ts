import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Map Labels Toggle', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should enable show labels toggle and update localStorage', async ({ page }) => {
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

    const toggleLabelsButton = page.getByTestId('toggle-labels-button');

    await toggleLabelsButton.click();
    await page.waitForTimeout(500);

    const toggleButtonClassAfter = await toggleLabelsButton.getAttribute('class');
    expect(toggleButtonClassAfter).toMatch(/active|selected|bg-primary|pressed|enabled/);

    const storedPrefs = await page.evaluate(() => {
      const stored = localStorage.getItem('deld-map-preferences');
      return stored ? JSON.parse(stored) : null;
    });
    expect(storedPrefs).toBeTruthy();
    expect(storedPrefs.showLabels).toBe(true);
  });
});