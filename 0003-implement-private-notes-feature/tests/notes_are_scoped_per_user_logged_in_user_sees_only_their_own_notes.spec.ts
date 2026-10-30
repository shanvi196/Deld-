import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

test('Notes are scoped per user - logged-in user sees only their own notes', async ({ page }) => {
  const homePage = new HomePage(page);

  await homePage.goto();
  await homePage.expectRestaurantCardsToBeVisible();

  const restaurantId1 = await homePage.getRestaurantIdFromCard(0);
  const restaurantId2 = await homePage.getRestaurantIdFromCard(1);
  const restaurantId3 = await homePage.getRestaurantIdFromCard(2);

  await page.evaluate((args) => {
    const notes = {
      [args.sarahEmail]: {
        [args.r1]: { text: 'Sarah loves tiramisu', updatedAt: '2024-06-15T10:30:00.000Z' },
        [args.r2]: { text: 'Sarah brunch spot', updatedAt: '2024-06-14T08:00:00.000Z' }
      },
      'other.user@email.com': {
        [args.r3]: { text: 'Other user pick', updatedAt: '2024-06-13T12:00:00.000Z' }
      }
    };
    localStorage.setItem('restaurant-notes', JSON.stringify(notes));
  }, { sarahEmail: TEST_USER.email, r1: restaurantId1, r2: restaurantId2, r3: restaurantId3 });

  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.goto('http://localhost:3000/user/notes');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId(`note-card-text-${restaurantId1}`)).toBeVisible();
  await expect(page.getByTestId(`note-card-text-${restaurantId1}`)).toHaveText('Sarah loves tiramisu');
  await expect(page.getByTestId(`note-card-text-${restaurantId2}`)).toBeVisible();
  await expect(page.getByTestId(`note-card-text-${restaurantId2}`)).toHaveText('Sarah brunch spot');

  await expect(page.getByTestId(`note-card-${restaurantId3}`)).not.toBeVisible();

  await expect(page.getByTestId('notes-count-badge')).toHaveText('2');
});