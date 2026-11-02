import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';
import { CollectionsPage } from './pages/collections_page';

test.describe('Empty State - Create First Collection Button', () => {
  let homePage: HomePage;
  let collectionsPage: CollectionsPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    collectionsPage = new CollectionsPage(page);

    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();

    // Delete all collections to ensure empty state
    const baseUrl = new URL(page.url()).origin;
    const collectionsResponse = await page.request.get(`${baseUrl}/api/collections`);
    
    if (collectionsResponse.ok()) {
      const collectionsData = await collectionsResponse.json();
      const collections = collectionsData.data?.collections || [];
      
      for (const collection of collections) {
        if (collection?.id) {
          await page.request.delete(`${baseUrl}/api/collections?collectionId=${collection.id}`);
        }
      }
    }
  });

  test('should open create collection dialog when clicking create first collection button', async ({ page }) => {
    await page.goto('http://localhost:3000/user/collections');
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);

    // Verify empty state is visible
    const emptyState = page.getByTestId('empty-collections-state');
    await expect(emptyState).toBeVisible();

    // Click create first collection button
    const ctaButton = page.getByTestId('create-first-collection-button');
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();
    await page.waitForTimeout(500);

    // Verify dialog appears
    const dialog = page.getByTestId('create-collection-dialog');
    await expect(dialog).toBeVisible();

    // Verify input field exists and is focused with empty value
    const collectionNameInput = page.getByTestId('collection-name-input');
    await expect(collectionNameInput).toBeVisible();
    await expect(collectionNameInput).toHaveValue('');
    await expect(collectionNameInput).toBeFocused();
  });
});