import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('should evict the oldest unpinned note when saving an 11th note exceeding the 10-note cap', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate((email) => {
    const notes = {};
    notes[email] = {};
    for (let i = 1; i <= 10; i++) {
      const id = 'rest-' + String(i).padStart(2, '0');
      notes[email][id] = {
        text: 'Note for restaurant ' + i,
        pinned: i === 2,
        createdAt: '2024-01-' + String(i).padStart(2, '0') + 'T00:00:00.000Z',
        updatedAt: '2024-01-' + String(i).padStart(2, '0') + 'T00:00:00.000Z'
      };
    }
    localStorage.setItem('restaurant-notes', JSON.stringify(notes));
  }, TEST_USER.email);

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();

  await page.getByTestId('add-note-button').click();
  await page.waitForTimeout(500);
  await page.getByTestId('note-input').fill('Brand new note');
  await page.getByTestId('save-note-button').click();

  await expect(page.getByText('Note saved')).toBeVisible({ timeout: 5000 });

  const storageData = await page.evaluate(({ email, restaurantId }) => {
    const data = JSON.parse(localStorage.getItem('restaurant-notes') || '{}');
    const userNotes = data[email] || {};
    return {
      hasNewNote: !!userNotes[restaurantId],
      hasRest01: !!userNotes['rest-01'],
      hasRest02: !!userNotes['rest-02'],
      rest02Pinned: userNotes['rest-02']?.pinned,
      totalNotes: Object.keys(userNotes).length
    };
  }, { email: TEST_USER.email, restaurantId: TEST_RESTAURANT_ID });

  expect(storageData.hasNewNote).toBe(true);
  expect(storageData.hasRest01).toBe(false);
  expect(storageData.hasRest02).toBe(true);
  expect(storageData.rest02Pinned).toBe(true);
  expect(storageData.totalNotes).toBe(10);
});