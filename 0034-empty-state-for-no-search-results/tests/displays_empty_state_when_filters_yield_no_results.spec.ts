import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Empty Search State - Display empty state when filters yield no results', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('displays empty state when filters yield no results', async ({ page }) => {
    await page.goto('http://localhost:3000/?price=$$$$&location=Invalid-location-xyz');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const emptyStateImage = page.locator("[data-testid='empty-state-image']");
    await expect(emptyStateImage).toBeVisible();
    

    const emptyStateHeading = page.getByTestId('empty-state-heading');
    await expect(emptyStateHeading).toBeVisible();
    await expect(emptyStateHeading).toContainText('No restaurants found');

      const emptyStateHeading2 = page.locator('.text-2xl.font-extrabold');
    await expect(emptyStateHeading2).toBeVisible();
    await expect(emptyStateHeading2).toContainText("Sorry, but we didn't understand the location you entered.");

  });
});