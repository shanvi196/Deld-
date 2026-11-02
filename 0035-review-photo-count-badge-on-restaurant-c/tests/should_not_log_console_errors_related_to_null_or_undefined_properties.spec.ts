import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test.describe('Photo Count Badge - No Console Errors', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should not log console errors related to null or undefined properties', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await homePage.goto();
    await homePage.expectRestaurantCardsToBeVisible();

    await page.waitForTimeout(1000);

    const nullUndefinedErrors = consoleErrors.filter(
      (error) =>
        error.includes('Cannot read properties of null') ||
        error.includes('Cannot read properties of undefined')
    );

    expect(nullUndefinedErrors.length).toBe(0);
  });
});