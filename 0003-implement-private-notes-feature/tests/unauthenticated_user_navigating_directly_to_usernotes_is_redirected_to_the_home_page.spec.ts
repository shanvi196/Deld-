import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';

test('Unauthenticated user navigating directly to /user/notes is redirected to the home page', async ({ page }) => {
  await page.goto('http://localhost:3000/user/notes');

  await page.waitForTimeout(1000);

  expect(new URL(page.url()).pathname).toBe('/');

  await expect(page.getByTestId('my-notes-heading')).not.toBeVisible();

  const homePage = new HomePage(page);
  await homePage.expectRestaurantCardsToBeVisible();
});