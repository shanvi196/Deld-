import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Group Dining Planner - Create Event and See Shareable Link', () => {
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

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('groupEvents');
    });
  });

  test('should create group event and see shareable link', async ({ page }) => {
    const planGroupVisitButton = page.getByTestId('plan-group-visit-button');
    await planGroupVisitButton.click();
    await page.waitForTimeout(500);

    const groupEventModal = page.getByTestId('group-event-modal');
    await expect(groupEventModal).toBeVisible();

    const eventNameInput = page.getByTestId('event-name-input');
    await eventNameInput.fill('Birthday Dinner');

    const eventDateInput = page.getByTestId('event-date-input');
    await eventDateInput.fill('2025-12-25');

    const createEventButton = page.getByTestId('create-event-button');
    await createEventButton.click();
    await page.waitForTimeout(1000);

    await expect(page.getByText('Event created successfully')).toBeVisible({ timeout: 5000 });

    const eventShareLink = page.getByTestId('event-share-link');
    await expect(eventShareLink).toBeVisible();

    const shareLinkValue = await eventShareLink.getAttribute('value');
    expect(shareLinkValue).toMatch(/\/events\/event_[0-9]+_[a-zA-Z0-9]+/);

  });
});