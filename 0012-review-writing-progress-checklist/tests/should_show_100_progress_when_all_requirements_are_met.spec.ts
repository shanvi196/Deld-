import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Progress bar shows 100% when all items complete', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test('should show 100% progress when all requirements are met', async ({ page }) => {
    await page.goto(`http://localhost:3000/write-review/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const ratingStar5 = page.getByTestId('rating-star-5');
    await ratingStar5.click();
    await page.waitForTimeout(300);

    const titleInput = page.getByTestId('review-title-input').or(page.locator('input[name="title"]')).or(page.getByPlaceholder(/title/i));
    if (await titleInput.count() > 0) {
      await titleInput.first().fill('Great dining experience');
      await page.waitForTimeout(300);
    }

    const reviewTextarea = page.getByTestId('review-textarea');
    const reviewText = 'This restaurant exceeded all my expectations! The food was absolutely delicious and the service was impeccable.';
    await reviewTextarea.fill(reviewText);
    await page.waitForTimeout(300);

    const dineInRadio = page.locator('#visit-type-dine-in');
    await dineInRadio.click();
    await page.waitForTimeout(500);

    const progressFill = page.getByTestId('review-progress-fill');
    const finalStyle = await progressFill.getAttribute('style');
    expect(finalStyle).toMatch(/width:\s*100%/);

    await expect(page.getByText('100%')).toBeVisible();

    
    
    const checklistPanel =page.locator('[data-testid="review-checklist-panel"]');
    const trigger = page.getByTestId('checklist-trigger');
    await trigger.click();
    const checklistItems = checklistPanel.locator('[data-testid^="checklist-item-"]');
    const itemCount = await checklistItems.count();
    expect(itemCount).toBe(4);

    for (let i = 0; i < itemCount; i++) {
    const item = checklistItems.nth(i);
      const itemClass = await item.getAttribute('class');
      expect(itemClass).toMatch(/green|success|complete/i);
    }
  });
});