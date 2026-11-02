import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Map Control Panel Visibility', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should display map control panel with all buttons on home page', async ({ page }) => {
    await homePage.goto();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const mapControlPanel = page.getByTestId('map-control-panel');
    await expect(mapControlPanel).toBeVisible();

    const pinStyleButton = page.getByTestId('marker-style-pin');
    await expect(pinStyleButton).toBeVisible();

    const circleStyleButton = page.getByTestId('marker-style-circle');
    await expect(circleStyleButton).toBeVisible();

    const toggleLabelsButton = page.getByTestId('toggle-labels-button');
    await expect(toggleLabelsButton).toBeVisible();
  });
});