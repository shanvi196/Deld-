import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home_page';
import { TEST_USER } from './fixtures/test_users';

const TEST_RESTAURANT_ID = '25047088-5a40-4fab-be5c-3ee9a54fb980';

test.describe('Checklist panel expands and collapses', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test('should expand and collapse checklist panel', async ({ page }) => {
    await page.goto(`http://localhost:3000/write-review/${TEST_RESTAURANT_ID}`);
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    const checklistTrigger = page.getByTestId('checklist-trigger');
    await expect(checklistTrigger).toBeVisible();

    await checklistTrigger.click();
    await page.waitForTimeout(500);

    const checklistPanel = page.getByTestId('review-checklist-panel');
    await expect(checklistPanel).toBeVisible();

    const checklistItems = page.locator('[data-testid^="checklist-item-"]');
    await expect(checklistItems).toHaveCount(4);

    await checklistTrigger.click();
    await page.waitForTimeout(500);

    const panelContent = checklistPanel.locator('[data-testid^="checklist-item-"]');
    const isHidden = await panelContent.first().isHidden();
    expect(isHidden).toBeTruthy();
  });
});