import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Map Multiple Preferences Persistence', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should persist multiple preference changes together in localStorage', async ({ page }) => {
    await homePage.goto();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      localStorage.setItem('deld-map-preferences', JSON.stringify({ markerStyle: 'pin', showLabels: false }));
    });

    await homePage.goto();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const circleStyleButton = page.getByTestId('marker-style-circle');
    const toggleLabelsButton = page.getByTestId('toggle-labels-button');

    await circleStyleButton.click();
    await page.waitForTimeout(500);

    await toggleLabelsButton.click();
    await page.waitForTimeout(500);

    const storedPrefs = await page.evaluate(() => {
      const stored = localStorage.getItem('deld-map-preferences');
      return stored ? JSON.parse(stored) : null;
    });
    expect(storedPrefs).toBeTruthy();
    expect(storedPrefs.markerStyle).toBe('circle');
    expect(storedPrefs.showLabels).toBe(true);

    await page.reload();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const circleButtonClassAfterReload = await circleStyleButton.getAttribute('class');
    expect(circleButtonClassAfterReload).toMatch(/active|selected|bg-primary|pressed/);

    const toggleButtonClassAfterReload = await toggleLabelsButton.getAttribute('class');
    expect(toggleButtonClassAfterReload).toMatch(/active|selected|bg-primary|pressed|enabled/);
  });
});