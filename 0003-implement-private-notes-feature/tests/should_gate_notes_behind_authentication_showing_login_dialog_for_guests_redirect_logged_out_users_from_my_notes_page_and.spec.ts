import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';
const SECOND_USER = { email: 'mike.rodriguez@email.com', password: 'password123' };

test('should gate notes behind authentication showing login dialog for guests, redirect logged-out users from My Notes page, and isolate notes between user accounts', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await homePage.goto();
  await page.evaluate(() => localStorage.removeItem('restaurant-notes'));

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();

  const addNoteButton = page.getByTestId('add-note-button');
  await expect(addNoteButton).toBeVisible();
  await expect(addNoteButton).toContainText('Add Note');
  await expect(page.getByTestId('notes-count-badge')).not.toBeVisible();

  await addNoteButton.click();
  await page.waitForTimeout(500);
  await homePage.loginComponent.expectDialogToBeVisible();
  await expect(page.getByTestId('note-dialog')).not.toBeVisible();

  await homePage.loginComponent.closeWithEscape();
  await page.waitForTimeout(500);

  await page.goto('http://localhost:3000/user/notes');
  await page.waitForTimeout(2000);
  const currentUrl = new URL(page.url());
  expect(currentUrl.pathname).toBe('/');

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(1000);

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();

  await page.getByTestId('add-note-button').click();
  await page.waitForTimeout(500);
  await page.getByTestId('note-input').fill("Sarah's private burger review");
  await page.getByTestId('save-note-button').click();
  await expect(page.getByText('Note saved')).toBeVisible({ timeout: 5000 });
  await expect(page.getByTestId('notes-count-badge')).toHaveText('1');

  await homePage.topBar.openUserMenu();
  await homePage.topBar.userAvatarMenuLogout.click();
  await page.waitForTimeout(2000);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(SECOND_USER.email, SECOND_USER.password);
  await homePage.loginComponent.expectSuccessMessage();
  await page.waitForTimeout(1000);

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();

  await expect(page.getByTestId('add-note-button')).toContainText('Add Note');
  await expect(page.getByTestId('notes-count-badge')).not.toBeVisible();

  await page.goto('http://localhost:3000/user/notes');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('my-notes-empty')).toBeVisible();

  const storageData = await page.evaluate(({ sarahEmail, mikeEmail, restaurantId }) => {
    const data = JSON.parse(localStorage.getItem('restaurant-notes') || '{}');
    return {
      sarahNote: data[sarahEmail]?.[restaurantId]?.text,
      mikeNotes: data[mikeEmail]
    };
  }, { sarahEmail: TEST_USER.email, mikeEmail: SECOND_USER.email, restaurantId: TEST_RESTAURANT_ID });

  expect(storageData.sarahNote).toBe("Sarah's private burger review");
  expect(storageData.mikeNotes).toBeUndefined();
});