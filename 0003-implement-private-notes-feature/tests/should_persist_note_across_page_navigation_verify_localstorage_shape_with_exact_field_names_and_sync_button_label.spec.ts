import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('should persist note across page navigation, verify localStorage shape with exact field names, and sync button label', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate(() => localStorage.removeItem('restaurant-notes'));

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();

  const addNoteButton = page.getByTestId('add-note-button');
  await expect(addNoteButton).toBeVisible();
  await expect(addNoteButton).toContainText('Add Note');

  await addNoteButton.click();
  await page.waitForTimeout(500);

  const noteInput = page.getByTestId('note-input');
  await expect(noteInput).toBeVisible();
  await noteInput.fill('Amazing carbonara, ask for extra pecorino');

  await page.getByTestId('save-note-button').click();

  await expect(page.getByText('Note saved')).toBeVisible({ timeout: 5000 });

  const storageData = await page.evaluate(({ email, restaurantId }) => {
    const raw = localStorage.getItem('restaurant-notes');
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data[email]?.[restaurantId];
  }, { email: TEST_USER.email, restaurantId: TEST_RESTAURANT_ID });

  expect(storageData).not.toBeNull();
  expect(storageData.text).toBe('Amazing carbonara, ask for extra pecorino');
  expect(storageData.pinned).toBe(false);
  expect(typeof storageData.createdAt).toBe('string');
  expect(typeof storageData.updatedAt).toBe('string');
  expect(new Date(storageData.createdAt).toISOString()).toBe(storageData.createdAt);
  expect(new Date(storageData.updatedAt).toISOString()).toBe(storageData.updatedAt);

  await page.goto('http://localhost:3000/user/notes');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId(`note-card-${TEST_RESTAURANT_ID}`)).toBeVisible();
  await expect(page.getByTestId(`note-card-text-${TEST_RESTAURANT_ID}`)).toHaveText('Amazing carbonara, ask for extra pecorino');
  await expect(page.getByTestId('notes-count-badge')).toHaveText('1');

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();

  await expect(addNoteButton).toContainText('Edit Note');

  await addNoteButton.click();
  await page.waitForTimeout(500);
  await expect(noteInput).toHaveValue('Amazing carbonara, ask for extra pecorino');
});