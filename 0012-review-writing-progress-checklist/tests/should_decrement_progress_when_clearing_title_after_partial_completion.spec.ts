import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Progress decrements correctly when clearing title field', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test('should decrement progress when clearing title after partial completion', async ({ page }) => {

    await page.goto(`http://localhost:3000/write-review/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const ratingStar3 = page.getByTestId('rating-star-3');
    await ratingStar3.click();
    await page.waitForTimeout(300);

    const titleInput = page.getByTestId('review-title-input').or(page.locator('input[name="title"]')).or(page.getByPlaceholder(/title/i));
    if (await titleInput.count() > 0) {
      await titleInput.first().fill('My Review');
      await page.waitForTimeout(500);
    }

    const progressFill = page.getByTestId('review-progress-fill');
    const midProgressStyle = await progressFill.getAttribute('style');
    expect(midProgressStyle).toMatch(/width:\s*(4[0-9]|5[0-9]|60)%/);

    const checklistPanel =page.locator('[data-testid="review-checklist-panel"]');
    const trigger = page.getByTestId('checklist-trigger');
    await trigger.click();

    const checklistItemRating = page.getByTestId('checklist-item-rating');
    const checklistItemTitle = page.getByTestId('checklist-item-title');

    let ratingHasCheckmark = await checklistItemRating.locator('svg').count() > 0 ||
                             await checklistItemRating.locator('[class*="check"]').count() > 0;
    expect(ratingHasCheckmark).toBeTruthy();

    let titleHasCheckmark = await checklistItemTitle.locator('svg').count() > 0 ||
                            await checklistItemTitle.locator('[class*="check"]').count() > 0;
    expect(titleHasCheckmark).toBeTruthy();

    if (await titleInput.count() > 0) {
      await titleInput.first().clear();
      await page.waitForTimeout(500);
    }

    const decrementedStyle = await progressFill.getAttribute('style');
    expect(decrementedStyle).toMatch(/width:\s*(2[0-9]|30)%/);

    titleHasCheckmark = await checklistItemTitle.locator('svg').count() > 0 ||
                        await checklistItemTitle.locator('[class*="check"]').count() > 0;
    const titleClass = await checklistItemTitle.getAttribute('class');
    expect(titleHasCheckmark).toBeFalsy();
    expect(titleClass).not.toMatch(/green|success|complete/i);

    ratingHasCheckmark = await checklistItemRating.locator('svg').count() > 0 ||
                         await checklistItemRating.locator('[class*="check"]').count() > 0;
    expect(ratingHasCheckmark).toBeTruthy();
  });
});