import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Group Dining Planner - Multiple Events for Same Restaurant', () => {
  let homePage: HomePage;
  let restaurantDetailsPage: RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    restaurantDetailsPage = new RestaurantDetailsPage(page);

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    await page.evaluate((restaurantId) => {
      const existingEvent = {
        id: 'evt_existing001',
        restaurantId: restaurantId,
        name: 'First Event',
        date: '2025-09-01',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('groupEvents', JSON.stringify([existingEvent]));
    }, TEST_RESTAURANT_ID);

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

  test('should store multiple events for same restaurant separately in localStorage', async ({ page }) => {
    const planGroupVisitButton = page.getByTestId('plan-group-visit-button');
    await planGroupVisitButton.click();
    await page.waitForTimeout(500);

    const eventNameInput = page.getByTestId('event-name-input');
    await eventNameInput.fill('Second Event');

    const eventDateInput = page.getByTestId('event-date-input');
    await eventDateInput.fill('2025-09-15');

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
    expect(groupEventsData.length).toBe(2);

    expect(groupEventsData[0].name).toBe('First Event');
    expect(groupEventsData[1].name).toBe('Second Event');

    expect(groupEventsData[0].restaurantId).toBe(TEST_RESTAURANT_ID);
    expect(groupEventsData[1].restaurantId).toBe(TEST_RESTAURANT_ID);

    expect(groupEventsData[0].id).not.toBe(groupEventsData[1].id);
  });
});