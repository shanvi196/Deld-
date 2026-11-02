import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';
import { RestaurantDetailsPage } from './pages/restaurant_details_page';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Progress state resets when navigating away and returning', () => {
  let homePage: HomePage;
  let restaurantDetailsPage : RestaurantDetailsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test('should reset progress when using browser back/forward', async ({ page }) => {
    await page.goto(`http://localhost:3000/restaurants/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    restaurantDetailsPage = new RestaurantDetailsPage(page);
    
    const editButtonVisible = await page.getByTestId('edit-review-button').isVisible().catch(() => false);
    const isEditingExistingReview = editButtonVisible;
    
    await restaurantDetailsPage.clickWriteReview();

    const progressFill = page.getByTestId('review-progress-fill');
    
    if (isEditingExistingReview) {
      const initialStyle = await progressFill.getAttribute('style');
      expect(initialStyle).toMatch(/width:\s*100%/);
    } else {
      const ratingStar4 = page.getByTestId('rating-star-4');
      await ratingStar4.click();
      await page.waitForTimeout(500);

      const titleInput = page.getByTestId('review-title-input').or(page.locator('input[name="title"]')).or(page.getByPlaceholder(/title/i));
      if (await titleInput.count() > 0) {
        await titleInput.first().fill('Great food');
        await page.waitForTimeout(500);
      }

      const midProgressStyle = await progressFill.getAttribute('style');
      expect(midProgressStyle).not.toMatch(/width:\s*0%/);
    }

    await page.goBack();
    await page.waitForTimeout(1000);

    await page.goForward();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const resetStyle = await progressFill.getAttribute('style');
    
    if (isEditingExistingReview) {
      expect(resetStyle).toMatch(/width:\s*100%/);
    } else {
      expect(resetStyle).toMatch(/width:\s*0%/);
      
      const ratingStars = page.locator('[data-testid^="rating-star-"][aria-pressed="true"], [data-testid^="rating-star-"].selected, [data-testid^="rating-star-"][data-selected="true"]');
      const selectedCount = await ratingStars.count();
      expect(selectedCount).toBe(0);
    }
  });
});