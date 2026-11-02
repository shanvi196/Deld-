import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Group Dining Planner - Event Persisted in localStorage', () => {
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

  test('should persist event in localStorage after creation', async ({ page }) => {
    const planGroupVisitButton = page.getByTestId('plan-group-visit-button');
    await planGroupVisitButton.click();
    await page.waitForTimeout(500);

    const eventNameInput = page.getByTestId('event-name-input');
    await eventNameInput.fill('Team Lunch');

    const eventDateInput = page.getByTestId('event-date-input');
    await eventDateInput.fill('2025-11-15');

    const createEventButton = page.getByTestId('create-event-button');
    await createEventButton.click();
    await page.waitForTimeout(1000);

    await expect(page.getByText('Event created successfully')).toBeVisible({ timeout: 5000 });

    const groupEventsData = await page.evaluate(() => {
      const data = localStorage.getItem('groupEvents');
      return data ? JSON.parse(data) : null;
    });

    expect(groupEventsData).not.toBeNull();
    expect(Array.isArray(groupEventsData)).toBe(true);
    expect(groupEventsData.length).toBeGreaterThanOrEqual(1);

    const event = groupEventsData[groupEventsData.length - 1];
    expect(event).toHaveProperty('id');
    expect(event).toHaveProperty('restaurantId');
    expect(event).toHaveProperty('name');
    expect(event).toHaveProperty('date');
    expect(event).toHaveProperty('createdAt');

    expect(event.name).toBe('Team Lunch');
    expect(event.restaurantId).toBe(TEST_RESTAURANT_ID);
  });
});