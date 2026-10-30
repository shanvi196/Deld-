import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('should show validation error for empty note submission, allow delete-cancel to return to dialog, and delete note from restaurant detail page updating all derived state', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate(({ email, restaurantId }) => {
    const notes = {};
    notes[email] = {
      [restaurantId]: { text: 'Great espresso', pinned: false, createdAt: '2024-06-15T10:00:00.000Z', updatedAt: '2024-06-15T10:00:00.000Z' }
    };
    localStorage.setItem('restaurant-notes', JSON.stringify(notes));
  }, { email: TEST_USER.email, restaurantId: TEST_RESTAURANT_ID });

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();

  await expect(page.getByTestId('notes-count-badge')).toHaveText('1');

  await page.getByTestId('add-note-button').click();
  await page.waitForTimeout(500);

  const noteDialog = page.getByTestId('note-dialog');
  await expect(noteDialog).toBeVisible();
  const noteInput = page.getByTestId('note-input');
  await expect(noteInput).toHaveValue('Great espresso');

  await noteInput.clear();
  await page.getByTestId('save-note-button').click();

  await expect(page.getByText('Note cannot be empty')).toBeVisible();
  await expect(noteDialog).toBeVisible();

  const storageCheck = await page.evaluate(({ email, restaurantId }) => {
    const data = JSON.parse(localStorage.getItem('restaurant-notes') || '{}');
    return data[email]?.[restaurantId]?.text;
  }, { email: TEST_USER.email, restaurantId: TEST_RESTAURANT_ID });
  expect(storageCheck).toBe('Great espresso');

  await noteInput.fill('Updated espresso note');

  await page.getByTestId('delete-note-button').click();
  await page.waitForTimeout(500);

  const confirmDialog = page.getByTestId('delete-confirm-dialog');
  await expect(confirmDialog).toBeVisible();
  await expect(confirmDialog).toContainText('Are you sure you want to delete this note?');

  await page.getByTestId('delete-cancel-button').click();
  await page.waitForTimeout(500);

  await expect(confirmDialog).not.toBeVisible();
  await expect(noteDialog).toBeVisible();
  await expect(noteInput).toHaveValue('Updated espresso note');

  await page.getByTestId('delete-note-button').click();
  await page.waitForTimeout(500);
  await page.getByTestId('delete-confirm-button').click();

  await expect(page.getByText('Note deleted')).toBeVisible({ timeout: 5000 });
  await expect(noteDialog).not.toBeVisible();
  await expect(page.getByTestId('notes-count-badge')).not.toBeVisible();
  await expect(page.getByTestId('add-note-button')).toContainText('Add Note');

  const deletedCheck = await page.evaluate(({ email, restaurantId }) => {
    const data = JSON.parse(localStorage.getItem('restaurant-notes') || '{}');
    return data[email]?.[restaurantId];
  }, { email: TEST_USER.email, restaurantId: TEST_RESTAURANT_ID });
  expect(deletedCheck).toBeUndefined();
});