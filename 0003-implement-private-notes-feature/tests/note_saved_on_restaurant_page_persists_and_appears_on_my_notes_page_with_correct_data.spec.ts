import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test('Note saved on restaurant page persists and appears on My Notes page with correct data', async ({ page }) => {
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

  await page.getByTestId('note-input').fill('Best tiramisu in the city');

  await page.getByTestId('save-note-button').click();
  await page.waitForTimeout(1000);

  await expect(page.getByText('Note saved')).toBeVisible();

  await expect(page.getByTestId('notes-count-badge')).toHaveText('1');

  await page.goto('http://localhost:3000/user/notes');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('my-notes-heading')).toContainText('My Notes');

  const noteCards = page.locator('[data-testid^="note-card-text-"]');
  await expect(noteCards).toHaveCount(1);

  await expect(page.getByTestId(`note-card-text-${TEST_RESTAURANT_ID}`)).toHaveText('Best tiramisu in the city');

  await expect(page.getByTestId(`note-card-timestamp-${TEST_RESTAURANT_ID}`)).toContainText('just now');

  await expect(page.getByTestId('notes-count-badge')).toHaveText('1');
});