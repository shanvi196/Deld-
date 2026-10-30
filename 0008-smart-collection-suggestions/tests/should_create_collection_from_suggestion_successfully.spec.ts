import { test, expect } from "@playwright/test";
import { TEST_USER } from "./fixtures/test_users";
import { CollectionsPage } from "./pages/collections_page";
import { HomePage } from "./pages/home_page";

test.describe("Smart Collection Suggestions - Create Collection", () => {
  let homePage: HomePage;
  let collectionsPage: CollectionsPage;
  const createdCollectionNames: string[] = [];

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    collectionsPage = new CollectionsPage(page);

    await homePage.goto();
    await homePage.openLoginDialog();
    await homePage.loginComponent.login(TEST_USER.email, TEST_USER.password);
    await homePage.loginComponent.expectSuccessMessage();
  });

  test.afterEach(async ({ page }) => {
    await page.waitForTimeout(1000);
    try {
      const baseUrl = new URL(page.url()).origin;
      for (const collectionName of createdCollectionNames) {
        const collectionsResponse = await page.request.get(`${baseUrl}/api/collections`);
        if (collectionsResponse.ok()) {
          const collectionsData = await collectionsResponse.json();
          const collection = collectionsData.data?.collections?.find((c: { name: string }) => c.name === collectionName);
          if (collection?.id) {
            await page.request.delete(`${baseUrl}/api/collections?collectionId=${collection.id}`);
          }
        }
      }
      createdCollectionNames.length = 0;
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  });

  test("should create collection from suggestion successfully", async ({ page }) => {
    await collectionsPage.goto();
    await collectionsPage.waitForCollectionsGridToLoad();

    const suggestionCards = page.getByTestId("suggestion-card");
    const firstCard = suggestionCards.first();
    await expect(firstCard).toBeVisible();

    const cardNameElement = firstCard.getByTestId("suggestion-card-name").or(firstCard.getByRole("heading").first());
    const cardName = await cardNameElement.textContent();
    if (cardName) {
      createdCollectionNames.push(cardName.trim());
    }

    const createButton = firstCard.getByTestId("create-suggestion-button");
    await createButton.click();

    const loadingIndicator = page.getByTestId("create-suggestion-loading");
    await expect(loadingIndicator).toBeVisible({ timeout: 5000 });

    const toast = page.getByText(/collection created/i);
    await expect(toast).toBeVisible({ timeout: 10000 });

    await expect(firstCard).not.toBeVisible({ timeout: 5000 });

    const collectionTiles = page.getByTestId("collection-tile-name");
    await expect(collectionTiles.filter({ hasText: new RegExp(cardName || "", "i") })).toBeVisible({ timeout: 5000 });
  });
});