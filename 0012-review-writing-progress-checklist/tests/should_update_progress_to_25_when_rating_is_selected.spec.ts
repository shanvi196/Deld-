import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';


test.describe('Progress bar updates to 25% when rating is selected', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test('should update progress to 25% when rating is selected', async ({ page }) => {
    await page.goto(`http://localhost:3000/write-review/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const progressFill = page.getByTestId('review-progress-fill');
    const initialStyle = await progressFill.getAttribute('style');
    expect(initialStyle).toMatch(/width:\s*0%/);

    const ratingStar4 = page.getByTestId('rating-star-4');
    await ratingStar4.click();
    await page.waitForTimeout(500);

    const updatedStyle = await progressFill.getAttribute('style');
    expect(updatedStyle).toMatch(/width:\s*(2[0-9]|30)%/);

    const checklistTrigger = page.getByTestId('checklist-trigger');
    await checklistTrigger.click();
    await page.waitForTimeout(300);

    const checklistItemRating = page.getByTestId('checklist-item-rating');
    await expect(checklistItemRating).toBeVisible();

    const hasCheckmark = await checklistItemRating.locator('svg').count() > 0 || 
                         await checklistItemRating.getByRole('img').count() > 0 ||
                         await checklistItemRating.locator('[class*="check"]').count() > 0;
    expect(hasCheckmark).toBeTruthy();

    const ratingClass = await checklistItemRating.getAttribute('class');
    expect(ratingClass).toMatch(/green|success|complete/i);
  });
});