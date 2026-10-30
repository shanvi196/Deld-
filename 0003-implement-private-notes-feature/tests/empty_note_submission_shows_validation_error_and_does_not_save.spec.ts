import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Empty note submission shows validation error and does not save', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate(() => localStorage.removeItem('restaurant-notes'));

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();

  await page.getByTestId('add-note-button').click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId('note-dialog')).toBeVisible();
  await expect(page.getByTestId('note-input')).toHaveValue('');

  await page.getByTestId('save-note-button').click();
  await page.waitForTimeout(500);

  await expect(page.getByText('Note cannot be empty')).toBeVisible();
  await expect(page.getByTestId('note-dialog')).toBeVisible();

  const hasNote = await page.evaluate((args) => {
    const data = localStorage.getItem('restaurant-notes');
    if (!data) return false;
    const parsed = JSON.parse(data);
    const userNotes = parsed[args.email];
    return userNotes ? args.restaurantId in userNotes : false;
  }, { email: TEST_USER.email, restaurantId: TEST_RESTAURANT_ID });

  expect(hasNote).toBe(false);
});