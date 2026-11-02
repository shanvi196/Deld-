import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Group Dining Planner - Open Event Creation Modal', () => {
  let homePage: HomePage;
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    restaurantDetailsPage = new RestaurantDetailsPage(page);

    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();

    await restaurantDetailsPage.goto(TEST_RESTAURANT_ID);
    await restaurantDetailsPage.waitForPageLoad();
  });

  test('should open event creation modal from restaurant detail page', async ({ page }) => {
    const planGroupVisitButton = page.getByTestId('plan-group-visit-button');
    await expect(planGroupVisitButton).toBeVisible();

    await planGroupVisitButton.click();
    await page.waitForTimeout(500);

    const groupEventModal = page.getByTestId('group-event-modal');
    await expect(groupEventModal).toBeVisible();

    const eventNameInput = page.getByTestId('event-name-input');
    await expect(eventNameInput).toBeVisible();
    await expect(eventNameInput).toHaveValue('');

    const eventDateInput = page.getByTestId('event-date-input');
    await expect(eventDateInput).toBeVisible();

    const createEventButton = page.getByTestId('create-event-button');
    await expect(createEventButton).toBeVisible();
  });
});