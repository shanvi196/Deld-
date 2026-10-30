import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Unauthenticated user clicking notes button opens login dialog instead of notes dialog', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('add-note-button')).toBeVisible();
  await expect(page.getByTestId('add-note-button')).toContainText('Add Note');

  await page.getByTestId('add-note-button').click();
  await page.waitForTimeout(500);

  await homePage.loginComponent.expectDialogToBeVisible();

  await expect(page.getByTestId('note-dialog')).not.toBeVisible();
});