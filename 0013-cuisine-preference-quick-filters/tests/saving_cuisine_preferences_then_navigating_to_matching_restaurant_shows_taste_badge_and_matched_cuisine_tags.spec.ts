import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = 'dc553a2b-ac48-4126-964b-bd95e45e5670';

test('Saving cuisine preferences then navigating to matching restaurant shows taste badge and matched cuisine tags', async ({ page }) => {
  const homePage = new HomePage(page);
  const restaurantDetailsPage = new RestaurantDetailsPage(page);

  await homePage.goto();
  await homePage.openLoginDialog();
  await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
  await homePage.loginComponent.expectSuccessMessage();

  await page.evaluate(() => {
    localStorage.removeItem('deld-cuisine-prefs-user_0001');
  });

  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await page.getByTestId('setup-cuisines-btn').click();
  await page.waitForTimeout(500);

  await page.getByTestId('add-cuisine-select').selectOption('italian');
  await page.waitForTimeout(500);

  await page.getByTestId('add-cuisine-select').selectOption('thai');
  await page.waitForTimeout(500);

  await expect(page.getByTestId('cuisine-count')).toContainText('2/10');

  await page.getByTestId('save-cuisine-prefs').click();
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('cuisine-quick-filters')).toBeVisible();
  await expect(page.getByTestId('cuisine-chip-italian')).toBeVisible();
  await expect(page.getByTestId('cuisine-chip-thai')).toBeVisible();

  const storedData = await page.evaluate(() => localStorage.getItem('deld-cuisine-prefs-user_0001'));
  expect(storedData).toBeTruthy();
  const parsed = JSON.parse(storedData as string);
  expect(parsed.cuisines).toEqual(['italian', 'thai']);
  expect(parsed.updatedAt).toBeTruthy();

  await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.getByTestId('matches-your-taste-badge')).toBeVisible();
  await expect(page.getByTestId('matches-your-taste-badge')).toContainText('Matches Your Taste');
  await expect(page.getByTestId('matched-cuisine-italian')).toBeVisible();
  await expect(page.getByTestId('matched-cuisine-thai')).toHaveCount(0);
});