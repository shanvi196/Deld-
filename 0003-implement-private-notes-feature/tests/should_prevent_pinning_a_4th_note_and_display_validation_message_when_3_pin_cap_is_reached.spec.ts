import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('should prevent pinning a 4th note and display validation message when 3-pin cap is reached', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate(({ email, restaurantId }) => {
    const notes = {};
    notes[email] = {
      'rest-a': { text: 'Pinned note A', pinned: true, createdAt: '2024-06-01T00:00:00.000Z', updatedAt: '2024-06-01T00:00:00.000Z' },
      'rest-b': { text: 'Pinned note B', pinned: true, createdAt: '2024-06-02T00:00:00.000Z', updatedAt: '2024-06-02T00:00:00.000Z' },
      'rest-c': { text: 'Pinned note C', pinned: true, createdAt: '2024-06-03T00:00:00.000Z', updatedAt: '2024-06-03T00:00:00.000Z' },
      [restaurantId]: { text: 'Unpinned note', pinned: false, createdAt: '2024-06-04T00:00:00.000Z', updatedAt: '2024-06-04T00:00:00.000Z' },
      'rest-e': { text: 'Another unpinned', pinned: false, createdAt: '2024-06-05T00:00:00.000Z', updatedAt: '2024-06-05T00:00:00.000Z' }
    };
    localStorage.setItem('restaurant-notes', JSON.stringify(notes));
  }, { email: TEST_USER.email, restaurantId: TEST_RESTAURANT_ID });

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await restaurantDetailsPage.waitForPageLoad();

  await page.getByTestId('add-note-button').click();
  await page.waitForTimeout(500);

  await expect(page.getByTestId('note-dialog')).toBeVisible();

  const pinToggle = page.getByTestId('note-pin-toggle');
  await expect(pinToggle).toBeVisible();
  await expect(pinToggle).not.toBeChecked();

  await pinToggle.click();

  await expect(page.getByText('Maximum of 3 pinned notes reached')).toBeVisible();
  await expect(pinToggle).not.toBeChecked();

  const pinnedCount = await page.evaluate((email) => {
    const data = JSON.parse(localStorage.getItem('restaurant-notes') || '{}');
    const userNotes = data[email] || {};
    return Object.values(userNotes).filter((n) => n.pinned).length;
  }, TEST_USER.email);
  expect(pinnedCount).toBe(3);
});