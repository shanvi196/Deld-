import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Deleting the last note hides badge and shows empty state on My Notes page', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate((args) => {
    const notes = {
      [args.email]: {
        [args.restaurantId]: { text: 'Lovely patio', updatedAt: new Date().toISOString() }
      }
    };
    localStorage.setItem('restaurant-notes', JSON.stringify(notes));
  }, { email: TEST_USER.email, restaurantId: TEST_RESTAURANT_ID });

  await page.goto('http://localhost:3000/user/notes');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('notes-count-badge')).toHaveText('1');
  await expect(page.getByTestId(`note-card-text-${TEST_RESTAURANT_ID}`)).toHaveText('Lovely patio');

  await page.getByTestId(`note-card-delete-${TEST_RESTAURANT_ID}`).click();
  await page.waitForTimeout(1000);

  await expect(page.getByText('Note deleted')).toBeVisible();

  await expect(page.getByTestId(`note-card-${TEST_RESTAURANT_ID}`)).not.toBeVisible();

  await expect(page.getByTestId('my-notes-empty')).toBeVisible();
  await expect(page.getByTestId('my-notes-empty')).toContainText('No notes yet');

  await expect(page.getByTestId('notes-count-badge')).not.toBeVisible();

  const hasNote = await page.evaluate((args) => {
    const data = localStorage.getItem('restaurant-notes');
    if (!data) return false;
    const parsed = JSON.parse(data);
    const userNotes = parsed[args.email];
    return userNotes ? args.restaurantId in userNotes : false;
  }, { email: TEST_USER.email, restaurantId: TEST_RESTAURANT_ID });

  expect(hasNote).toBe(false);
});