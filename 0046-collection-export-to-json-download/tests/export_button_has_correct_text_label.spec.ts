import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';
import { CollectionsPage } from './pages/collections_page';

test.describe('Collection Export - Export button text', () => {
  let homePage: HomePage;
  let collectionsPage: CollectionsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    collectionsPage = new CollectionsPage(page);
    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test('export button has correct text label', async ({ page }) => {
    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();
    const firstCollectionTile = page.locator('[data-testid^="collection-tile-"]').first();
    await firstCollectionTile.click();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);
    const exportButton = page.getByTestId('export-collection-button');
    await expect(exportButton).toContainText(/export/i);
  });
});