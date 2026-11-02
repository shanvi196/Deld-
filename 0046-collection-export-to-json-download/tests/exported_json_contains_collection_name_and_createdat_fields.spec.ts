import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/test_users';
import { HomePage } from './pages/home_page';
import { CollectionsPage } from './pages/collections_page';

test.describe('Collection Export - JSON contains name and createdAt', () => {
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

  test('exported JSON contains collection name and createdAt fields', async ({ page }) => {
    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();
    const firstCollectionTile = page.locator('[data-testid^="collection-tile-"]').first();
    await firstCollectionTile.click();
    await page.waitForTimeout(500);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await page.waitForTimeout(1000);
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-collection-button').click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) { chunks.push(chunk as Buffer); }
    const content = Buffer.concat(chunks).toString('utf-8');
    const json = JSON.parse(content);
    expect(json).toHaveProperty('name');
    expect(typeof json.name).toBe('string');
    expect(json.name.length).toBeGreaterThan(0);
    expect(json).toHaveProperty('createdAt');
    expect(typeof json.createdAt).toBe('string');
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    expect(json.createdAt).toMatch(dateRegex);
  });
});